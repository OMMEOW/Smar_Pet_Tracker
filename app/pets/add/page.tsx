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
  const [trackerId, setTrackerId] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableTrackers, setAvailableTrackers] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (authStatus === "authenticated") {
      const scanForTrackers = async () => {
        try {
          const res = await fetch("/api/pet/all");
          if (res.ok) {
            const data = await res.json();
            const trackers = data.map((pet: any) => pet.petId);
            setAvailableTrackers(trackers);
            if (trackers.length > 0 && !trackerId) {
              setTrackerId(trackers[0]);
            }
          }
        } catch (err) {
          console.error("Failed to scan trackers", err);
        } finally {
          setIsScanning(false);
        }
      };
      
      scanForTrackers();
      const intervalId = setInterval(scanForTrackers, 5000);
      return () => clearInterval(intervalId);
    }
  }, [authStatus, router, trackerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !breed || !trackerId) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: trackerId,
          name: petName,
          species: petType,
          breed,
          age: `${age} Years`,
        }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to add pet");
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
            {/* Left Column: Contextual Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl primary-gradient flex items-center justify-center text-white mb-6">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                </div>
                <h3 className="text-3xl font-extrabold font-headline leading-tight tracking-tight mb-4">Start Your Journey.</h3>
                <p className="text-secondary text-sm leading-relaxed font-label">
                  Secure your pet's future with precision Kinetic tracking. Our Guardian system provides real-time location alerts and health monitoring for your companion.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col justify-between h-32">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  <div>
                    <span className="block text-xl font-bold font-headline">99.9%</span>
                    <span className="text-xs text-secondary font-label uppercase tracking-widest">Accuracy</span>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col justify-between h-32">
                  <span className="material-symbols-outlined text-primary">battery_charging_full</span>
                  <div>
                    <span className="block text-xl font-bold font-headline">30 Days</span>
                    <span className="text-xs text-secondary font-label uppercase tracking-widest">Battery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form */}
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-4">
                    <label className="font-semibold text-secondary uppercase tracking-widest text-xs font-label">Pet Portrait</label>
                    <div className="group relative w-full h-48 rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden">
                      <div className="flex flex-col items-center transition-transform group-hover:scale-105 duration-300">
                        <span className="material-symbols-outlined text-4xl text-outline mb-2">add_a_photo</span>
                        <span className="text-sm font-semibold text-outline font-headline">Click to upload photo</span>
                        <span className="text-xs text-secondary/60 mt-1 font-label">High-quality portrait recommended</span>
                      </div>
                      <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Pet Name</label>
                      <input 
                        className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors" 
                        placeholder="e.g. Luna" 
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
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
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: petType === type ? "'FILL' 1" : "" }}>pets</span> {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Breed</label>
                      <input 
                        className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors" 
                        placeholder="e.g. Golden Retriever" 
                        type="text"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label">Age (Years)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          className="w-full bg-transparent border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-3 text-lg font-headline outline-none transition-colors" 
                          type="number"
                          value={age}
                          min="0"
                          max="30"
                          onChange={(e) => setAge(parseInt(e.target.value))}
                        />
                        <div className="flex gap-1">
                          <button onClick={() => setAge(Math.max(0, age - 1))} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-colors" type="button">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <button onClick={() => setAge(age + 1)} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-primary hover:text-white transition-colors" type="button">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-2">
                      <label className="font-semibold text-secondary text-xs uppercase tracking-widest font-label flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">radar</span> Detected ESP32 Trackers
                      </label>
                      
                      {isScanning && availableTrackers.length === 0 ? (
                        <div className="w-full bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <span className="text-sm font-headline text-secondary">Scanning for active collars nearby...</span>
                        </div>
                      ) : availableTrackers.length === 0 ? (
                        <div className="w-full bg-surface-container-low border border-warning/20 rounded-xl p-4 flex flex-col gap-1">
                          <span className="text-sm font-headline font-bold text-warning">No trackers found</span>
                          <span className="text-xs font-label text-secondary">Please power on your ESP32 collar. It will appear here automatically.</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select 
                            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary px-4 py-3 rounded-xl text-lg font-headline font-bold outline-none transition-colors appearance-none cursor-pointer" 
                            value={trackerId}
                            onChange={(e) => setTrackerId(e.target.value)}
                          >
                            {availableTrackers.map((id) => (
                              <option key={id} value={id}>Tracker ID: {id}</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">expand_more</span>
                        </div>
                      )}
                      <p className="text-xs text-secondary/60 mt-1 font-label">Select your powered-on ESP32 tracker from the list.</p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-error-container/20 rounded-2xl flex gap-3 items-start border border-error/10">
                      <span className="material-symbols-outlined text-error">error_outline</span>
                      <div>
                        <p className="text-sm font-semibold text-on-error-container font-headline">Action Required</p>
                        <p className="text-xs text-on-error-container/70 font-label">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-secondary/60">
                      <span className="material-symbols-outlined">security</span>
                      <span className="text-xs font-label">Data is encrypted and stored securely.</span>
                    </div>
                    <button 
                      className="primary-gradient text-white px-10 py-4 rounded-full font-bold font-headline shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-center disabled:opacity-50" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Adding Pet..." : "Add Pet to Guardian"}
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
