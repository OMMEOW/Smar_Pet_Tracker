"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [geofence, setGeofence] = useState({ lat: 19.123456, lng: 72.987654, radius: 100 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pet");
        const data = await res.json();
        if (data && data.geofence) setGeofence(data.geofence);
        setLoading(false);
      } catch (err) {
        console.error("fetch error:", err);
      }
    };
    fetchStatus();
  }, [authStatus]);

  if (authStatus === "loading") {
    return <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center text-white font-headline">Authenticating...</div>;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geofence }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-3xl">
            <header className="mb-10 md:mb-16">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">Configuration</p>
              <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">System Settings</h1>
            </header>

            <div className="space-y-8">
              <section className="bg-surface-container-low dark:bg-[#1a1c1f]/50 p-8 rounded-[2rem] border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-primary">security</span>
                  <h2 className="font-headline font-bold text-xl text-on-surface">Geofence Parameters</h2>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-[10px] font-bold uppercase text-secondary mb-1 ml-1 tracking-widest">Latitude</label>
                        <input 
                          className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 text-sm font-semibold py-2 px-1 transition-all text-on-surface" 
                          type="number" 
                          step="any"
                          value={geofence.lat}
                          onChange={(e) => setGeofence({ ...geofence, lat: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="relative group">
                        <label className="block text-[10px] font-bold uppercase text-secondary mb-1 ml-1 tracking-widest">Longitude</label>
                        <input 
                          className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 text-sm font-semibold py-2 px-1 transition-all text-on-surface" 
                          type="number" 
                          step="any"
                          value={geofence.lng}
                          onChange={(e) => setGeofence({ ...geofence, lng: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                   </div>

                   <div className="relative group">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold uppercase text-secondary ml-1 tracking-widest">Safe Zone Radius</label>
                        <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full">{geofence.radius}m</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="1000" 
                        step="10"
                        value={geofence.radius}
                        onChange={(e) => setGeofence({ ...geofence, radius: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary" 
                      />
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-[10px] font-bold text-secondary text-opacity-40 uppercase tracking-tighter">50m</span>
                        <span className="text-[10px] font-bold text-secondary text-opacity-40 uppercase tracking-tighter">1km</span>
                      </div>
                   </div>

                   <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Apply Configuration"}
                  </button>
                </div>
              </section>

              <section className="bg-surface-container-low dark:bg-[#1a1c1f]/50 p-8 rounded-[2rem] border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-secondary">notifications</span>
                  <h2 className="font-headline font-bold text-xl text-on-surface">Notifications</h2>
                </div>
                <p className="text-secondary text-sm font-medium">Alerts will be sent to your connected mobile device (GK-8821).</p>
              </section>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
