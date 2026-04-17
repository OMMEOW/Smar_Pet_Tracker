"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { StatusCard } from "@/components/StatusCard";
import { GeofenceControls } from "@/components/GeofenceControls";
import { AlertsSection } from "@/components/AlertsSection";

const MapLibreMap = dynamic(() => import("@/components/MapLibreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-container-low animate-pulse flex items-center justify-center font-headline font-bold text-slate-400">Initializing Open Radar...</div>
});

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export type Geofence = 
  | { type: "circle"; lat: number; lng: number; radius: number }
  | { type: "lasso"; coordinates: [number, number][] };

export default function Dashboard() {
  const [location, setLocation] = useState<Location | null>(null);
  const [alert, setAlert] = useState(false);
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mode, setMode] = useState<"circle" | "lasso">("circle");
  const [activeLassoPoints, setActiveLassoPoints] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pet");
        const data = await res.json();
        if (data) {
          if (data.location) setLocation(data.location);
          if (data.geofence) setGeofence(data.geofence);
          setAlert(data.alert || false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/pet/history");
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
      } catch (err) {
        console.error("History fetch error:", err);
      }
    };

    fetchStatus();
    fetchHistory();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateGeofence = async (newGeo: Geofence) => {
    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geofence: newGeo }),
      });
      if (res.ok) setGeofence(newGeo);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const formattedAlerts = history.slice(0, 5).map((h, i) => ({
    message: i === 0 && alert ? "Dog left geofence" : "Location update received",
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: (i === 0 && alert ? "danger" : "safe") as any
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 md:ml-64 relative">
          <div className="absolute inset-0 z-0 bg-surface-container-low">
             <MapLibreMap 
                center={location ? [location.latitude, location.longitude] : [19.076, 72.8777]}
                markerPosition={location ? [location.latitude, location.longitude] : null}
                geofence={geofence}
                mode={mode}
                activeLassoPoints={activeLassoPoints}
                onLassoPointsChange={setActiveLassoPoints}
                onLassoFinish={(coords) => {
                  setGeofence({ type: "lasso", coordinates: coords });
                  setActiveLassoPoints([]);
                }}
             />
          </div>

          {/* Floating Status Card (Top Right) */}
          <div className="absolute top-6 right-6 z-10 w-80 pointer-events-none md:pointer-events-auto">
            <StatusCard location={location} alert={alert} />
          </div>

          {/* Side Panel (Geofence Controls & Alerts) */}
          <div className="absolute left-6 top-6 bottom-6 z-10 w-72 hidden lg:flex flex-col gap-4 pointer-events-none">
            <GeofenceControls 
              mode={mode}
              onModeChange={(newMode) => {
                setMode(newMode);
                setActiveLassoPoints([]);
              }}
              initialGeofence={geofence} 
              onUpdate={handleUpdateGeofence}
              activeLassoPoints={activeLassoPoints}
              onLassoPointsChange={setActiveLassoPoints}
            />
            <AlertsSection alerts={formattedAlerts} />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
