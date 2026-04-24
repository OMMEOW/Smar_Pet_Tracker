"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { StatusCard } from "@/components/StatusCard";
import { GeofenceControls } from "@/components/GeofenceControls";
import { AlertsSection } from "@/components/AlertsSection";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "boneyard-js/react";

const MapLibreMap = dynamic(() => import("@/components/MapLibreMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-surface-container-low flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-40">Kinetic Radar</span>
        <p className="font-headline font-bold text-slate-400 text-xs">Initializing...</p>
      </div>
    </div>
  )
});

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export type Geofence =
  | { type: "circle"; lat: number; lng: number; radius: number }
  | { type: "lasso"; coordinates: [number, number][] };

export default function DashboardView() {
  const { data: session, status: authStatus } = useSession();

  const [location, setLocation] = useState<Location | null>(null);
  const [alert, setAlert] = useState(false);
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mode, setMode] = useState<"circle" | "lasso">("circle");
  const [activeLassoPoints, setActiveLassoPoints] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pet");
        if (res.status === 401) {
          await signOut({ callbackUrl: "/?logout=true" });
          return;
        }
        const data = await res.json();
        if (data) {
          if (data.location) setLocation(data.location);
          if (data.geofence) setGeofence(data.geofence);
          setAlert(data.alert || false);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
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
  }, [authStatus]);

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
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Map Section - Primary Focus */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Skeleton name="map" loading={isLoading}>
                <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 bg-surface-container-low relative">
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
              </Skeleton>

              {/* Geofence Controls - Visible on Mobile/Tablet below map, hidden on LG because it's in the sidebar column */}
              <div className="lg:hidden w-full">
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
              </div>
            </div>

            {/* Side Column - Status and Alerts */}
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="w-full">
                <Skeleton name="status-card" loading={isLoading}>
                  <StatusCard location={location} alert={alert} />
                </Skeleton>
              </div>

              {/* Geofence Controls - Visible only on LG+ in this column */}
              <div className="hidden lg:block w-full">
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
              </div>

              <div className="w-full flex-1">
                <Skeleton name="alerts" loading={isLoading}>
                  <AlertsSection alerts={formattedAlerts} />
                </Skeleton>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
