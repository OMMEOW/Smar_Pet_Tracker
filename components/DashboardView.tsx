"use client";

import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { StatusCard } from "@/components/StatusCard";
import { HeartRateCard } from "@/components/HeartRateCard";
import { GeofenceControls } from "@/components/GeofenceControls";
import { AlertsSection } from "@/components/AlertsSection";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "boneyard-js/react";
import { isPointInsideGeofence } from "@/lib/geofenceLogic";
import useSWR, { mutate } from "swr";

const MapLibreMap = dynamic(() => import("@/components/MapLibreMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-surface-container-low flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-40">Kinetic Radar</span>
    </div>
  )
});

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardView() {
  const { data: session, status: authStatus } = useSession();
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [activeLassoPoints, setActiveLassoPoints] = useState<[number, number][]>([]);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  // 1. Fetch Static Pet Data (Once)
  const { data: staticPets, error: staticError, isLoading: isStaticLoading } = useSWR(
    authStatus === "authenticated" ? "/api/pets/static" : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // 2. Fetch Live Telemetry (Every 3 seconds)
  const { data: liveTelemetry, mutate: mutateTelemetry } = useSWR(
    authStatus === "authenticated" ? "/api/live-telemetry" : null,
    fetcher,
    { refreshInterval: 3000, dedupingInterval: 2000 }
  );

  // 3. Fetch Live Alerts (Every 10 seconds)
  const { data: liveAlerts } = useSWR(
    authStatus === "authenticated" ? "/api/alerts/live" : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Merge static and live data
  const pets = useMemo(() => {
    if (!staticPets) return [];
    return staticPets.map((pet: any) => {
      const telemetry = liveTelemetry?.find((t: any) => t.deviceId?.toLowerCase() === pet.deviceId?.toLowerCase());
      
      const updatedPet = {
        ...pet,
        location: telemetry ? {
          latitude: Number(telemetry.latitude),
          longitude: Number(telemetry.longitude),
          timestamp: new Date(telemetry.timestamp).getTime()
        } : pet.location,
        pulseBpm: telemetry ? Number(telemetry.pulseBpm || 0) : (pet.pulseBpm || 0),
        pulseRaw: telemetry ? Number(telemetry.pulseRaw || 0) : (pet.pulseRaw || 0),
        isOnline: telemetry ? telemetry.online : false,
        lastSeen: telemetry ? new Date(telemetry.timestamp) : pet.lastSeen
      };

      const isInside = updatedPet.location && pet.geofence?.coordinates?.length
        ? isPointInsideGeofence(updatedPet.location.latitude, updatedPet.location.longitude, pet.geofence)
        : true;

      return {
        ...updatedPet,
        alert: !isInside
      };
    });
  }, [staticPets, liveTelemetry]);

  useEffect(() => {
    if (pets.length > 0 && !activePetId) {
      setActivePetId(pets[0].petId);
    }
  }, [pets, activePetId]);

  const activePet = useMemo(() => pets.find(p => p.petId === activePetId) || null, [pets, activePetId]);
  const globalBreach = useMemo(() => pets.find(p => p.alert === true), [pets]);

  const handleUpdateGeofence = async (coords: [number, number][]) => {
    if (!activePetId) return;
    try {
      const res = await fetch(`/api/pets/${activePetId}/geofence`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: coords }),
      });
      if (res.ok) {
        showToast("Geofence successfully updated.");
        // Re-fetch static data to get new geofence
        mutate("/api/pets/static");
      } else {
        showToast("Failed to update geofence.", "error");
      }
    } catch (err) {
      showToast("Connection error.", "error");
    }
  };

  const formattedAlerts = useMemo(() => {
    return (liveAlerts || []).map((a: any) => ({
      message: a.message,
      time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: a.type === "GEOFENCE_BREACH" ? "danger" : "safe"
    }));
  }, [liveAlerts]);

  const mapCenter = useMemo(() => {
    return activePet?.location 
      ? [activePet.location.latitude, activePet.location.longitude] 
      : [19.076, 72.8777];
  }, [activePetId]);

  if (authStatus === "loading" || isStaticLoading) {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <p className="text-secondary font-headline font-bold">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface relative">
      {globalBreach && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-bounce">
          <div className="bg-red-600 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-red-500/50 backdrop-blur-md bg-opacity-90">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-2xl font-bold">warning</span>
            </div>
            <div className="flex-1">
              <p className="font-headline font-black text-xs uppercase tracking-wider">BREACH DETECTED: {globalBreach.name}</p>
              <p className="text-[11px] font-bold opacity-90 leading-tight">Pet has left the designated safe zone.</p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm bg-primary text-white`}>
          <span className="material-symbols-outlined text-[20px] text-white">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {pets.length > 0 && (
                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                   {pets.map(p => (
                      <button 
                        key={p.petId}
                        onClick={() => setActivePetId(p.petId)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border shrink-0 ${p.petId === activePetId ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface-container-high text-secondary border-outline-variant/20 hover:bg-surface-container-highest'}`}
                      >
                         <img src={p.imageUrl || (p.species?.toLowerCase() === 'cat' ? '/cat.png' : '/dog.png')} className="w-6 h-6 rounded-full object-cover" alt={p.name} />
                         <span className="font-bold text-sm">{p.name}</span>
                         {p.alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                      </button>
                   ))}
                 </div>
              )}

              <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 bg-surface-container-low relative">
                <MapLibreMap
                  center={mapCenter as [number, number]}
                  pets={pets}
                  activePetId={activePetId}
                  geofenceCoordinates={activePet?.geofence?.coordinates}
                  activeLassoPoints={activeLassoPoints}
                  onLassoPointsChange={setActiveLassoPoints}
                  onLassoFinish={handleUpdateGeofence}
                  onPetSelect={setActivePetId}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:gap-8">
               {activePet && <StatusCard pet={activePet} />}
               
               {activePet && (
                 <HeartRateCard 
                   bpm={activePet.pulseBpm || 0} 
                   lastUpdated={activePet.lastSeen} 
                 />
               )}

               {activePet && (
                 <GeofenceControls
                   initialCoordinates={activePet.geofence?.coordinates || []}
                   onUpdate={handleUpdateGeofence}
                   activeLassoPoints={activeLassoPoints}
                   onLassoPointsChange={setActiveLassoPoints}
                 />
               )}

               <AlertsSection alerts={formattedAlerts} />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
