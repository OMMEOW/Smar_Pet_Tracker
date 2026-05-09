"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export default function AddPetPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [breed, setBreed] = useState("Indie (Desi Dog)");
  const [age, setAge] = useState(1);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    const fetchDevices = async () => {
      try {
        const res = await fetch("/api/devices");
        const data = await res.json();
        if (Array.isArray(data)) setDevices(data);
      } catch (err) { }
    };

    if (authStatus === "authenticated") {
      fetchDevices();
    }
  }, [authStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !breed || !selectedDeviceId) {
      setError("Please fill in all required fields, including selecting a tracker device.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: `${petName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`,
          deviceId: selectedDeviceId,
          name: petName,
          species: petType,
          breed,
          age: `${age} Years`,
        }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to add pet");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Guardian Registry</span>
          <p className="text-secondary font-headline font-bold">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 md:ml-0 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center text-white mb-6">
                  <span className="material-symbols-outlined text-3xl">pets</span>
                </div>
                <h3 className="text-3xl font-extrabold font-headline leading-tight tracking-tight mb-4">Start Your Journey.</h3>
                <p className="text-secondary text-sm leading-relaxed font-label">
                  Secure your pet's future with precision Kinetic tracking. Our Guardian system provides real-time location alerts and health monitoring.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Pet Name</label>
                      <input
                        className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors"
                        placeholder="e.g. Luna"
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value.replace(/\b\w/g, l => l.toUpperCase()))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Pet Type</label>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["Dog", "Cat", "Other"].map((type) => (
                          <button
                            key={type}
                            className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${petType === type ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'}`}
                            type="button"
                            onClick={() => setPetType(type)}
                          >
                            <span className="material-symbols-outlined text-lg">pets</span> {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Breed</label>
                      <select
                        className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors appearance-none cursor-pointer"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                      >
                        {petType === "Dog" && (
                          <>
                            <option value="Indie (Desi Dog)">Indie (Desi Dog)</option>
                            <option value="Labrador Retriever">Labrador Retriever</option>
                            <option value="Golden Retriever">Golden Retriever</option>
                            <option value="German Shepherd">German Shepherd</option>
                          </>
                        )}
                        {petType === "Cat" && (
                          <>
                            <option value="Indian Billi">Indian Billi</option>
                            <option value="Persian">Persian</option>
                          </>
                        )}
                        <option value="Other">Other / Not Listed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Tracker Device</label>
                      <select
                        className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors appearance-none cursor-pointer"
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select available tracker...</option>
                        {devices.map((dev) => (
                          <option
                            key={dev.deviceId}
                            value={dev.deviceId}
                            disabled={dev.assigned}
                            className={dev.assigned ? 'text-secondary/30' : 'text-on-surface'}
                          >
                            {dev.online ? '🟢' : '🔴'} {dev.deviceId} {dev.assigned ? '(Already Assigned)' : (dev.online ? '(Online)' : '(Offline)')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-error-container/10 rounded-2xl flex gap-3 items-start border border-error/10">
                      <span className="material-symbols-outlined text-error">error_outline</span>
                      <p className="text-xs text-on-error-container font-label">{error}</p>
                    </div>
                  )}

                  <div className="pt-6 flex justify-end">
                    <button
                      className="primary-gradient text-white px-10 py-4 rounded-full font-bold font-headline shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Adding Pet..." : "Add Pet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
