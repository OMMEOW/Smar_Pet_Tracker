"use client";

import { useEffect, useRef, useState } from "react";
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

const MIN_GEOFENCE_RADIUS_METERS = 30;
const MAX_GEOFENCE_RADIUS_METERS = 300;
const DEFAULT_GEOFENCE_RADIUS_METERS = 100;

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  satellites?: number;
  hdop?: number;
  distance?: number;
  pulseBpm?: number;
  pulseRaw?: number;
}

export type Geofence =
  | { type: "circle"; lat: number; lng: number; radius: number }
  | { type: "lasso"; coordinates: [number, number][] };

function clampGeofenceRadius(radius: unknown) {
  const value = Number(radius);
  if (!Number.isFinite(value)) return DEFAULT_GEOFENCE_RADIUS_METERS;
  return Math.min(Math.max(value, MIN_GEOFENCE_RADIUS_METERS), MAX_GEOFENCE_RADIUS_METERS);
}

function normalizeGeofence(geofence: any): Geofence {
  if (geofence?.type === "lasso") return geofence;

  return {
    type: "circle",
    lat: Number(geofence?.lat) || 0,
    lng: Number(geofence?.lng) || 0,
    radius: clampGeofenceRadius(geofence?.radius),
  };
}

export default function DashboardView() {
  const { data: session, status: authStatus } = useSession();

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("default_pet");
  const [selectedPetName, setSelectedPetName] = useState("Apollo");
  const [location, setLocation] = useState<Location | null>(null);
  const [alert, setAlert] = useState(false);
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mode, setMode] = useState<"circle" | "lasso">("circle");
  const [activeLassoPoints, setActiveLassoPoints] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const geofenceSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localGeofenceEditUntil = useRef(0);

  const liveCircleGeofence = geofence;

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const fetchPets = async () => {
      try {
        const res = await fetch("/api/pet/all");
        if (res.status === 401) {
          await signOut({ callbackUrl: "/?logout=true" });
          return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPets(data);
          setSelectedPetId((current) =>
            data.some((pet) => pet.petId === current) ? current : data[0].petId
          );
        }
      } catch (err) {
        console.error("Pets fetch error:", err);
      }
    };

    fetchPets();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const petQuery = `petId=${encodeURIComponent(selectedPetId)}`;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/pet?${petQuery}`);
        if (res.status === 401) {
          await signOut({ callbackUrl: "/?logout=true" });
          return;
        }
        const data = await res.json();
        if (data) {
          setSelectedPetName(data.name || selectedPetId);
          setLocation(data.location || null);
          if (data.geofence && Date.now() > localGeofenceEditUntil.current) {
            setGeofence(normalizeGeofence(data.geofence));
          }
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
        const res = await fetch(`/api/pet/history?${petQuery}`);
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
      } catch (err) {
        console.error("History fetch error:", err);
      }
    };

    const fetchLiveData = () => {
      fetchStatus();
      fetchHistory();
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, [authStatus, selectedPetId]);

  const normalizeLiveCircle = (newGeo: Geofence): Geofence => {
    if (newGeo.type !== "circle") return newGeo;
    return {
      ...newGeo,
      radius: clampGeofenceRadius(newGeo.radius),
    };
  };

  const saveGeofence = async (nextGeofence: Geofence) => {
    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId: selectedPetId, geofence: nextGeofence }),
      });
      if (res.ok) setGeofence(nextGeofence);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handlePreviewGeofence = (newGeo: Geofence) => {
    const nextGeofence = normalizeLiveCircle(newGeo);
    localGeofenceEditUntil.current = Date.now() + 8000;
    setGeofence(nextGeofence);

    if (geofenceSaveTimer.current) {
      clearTimeout(geofenceSaveTimer.current);
    }

    if (nextGeofence.type === "circle") {
      geofenceSaveTimer.current = setTimeout(() => {
        saveGeofence(nextGeofence).finally(() => {
          localGeofenceEditUntil.current = Date.now() + 1000;
        });
      }, 700);
    }
  };

  const handleUpdateGeofence = async (newGeo: Geofence) => {
    const nextGeofence = normalizeLiveCircle(newGeo);
    localGeofenceEditUntil.current = Date.now() + 8000;

    if (geofenceSaveTimer.current) {
      clearTimeout(geofenceSaveTimer.current);
      geofenceSaveTimer.current = null;
    }

    await saveGeofence(nextGeofence);
    localGeofenceEditUntil.current = Date.now() + 1000;
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-primary uppercase font-label">
                    Connected Pet
                  </p>
                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface capitalize">
                    {selectedPetName}
                  </h1>
                </div>
                <select
                  value={selectedPetId}
                  onChange={(event) => {
                    setSelectedPetId(event.target.value);
                    setIsLoading(true);
                  }}
                  className="w-full sm:w-64 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3 font-headline font-bold text-sm text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Select connected pet"
                >
                  {pets.length === 0 ? (
                    <option value="default_pet">Apollo</option>
                  ) : (
                    pets.map((pet) => (
                      <option key={pet.petId} value={pet.petId}>
                        {pet.name || pet.petId}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <Skeleton name="map" loading={isLoading}>
                <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 bg-surface-container-low relative">
                  <MapLibreMap
                    center={location ? [location.latitude, location.longitude] : [19.076, 72.8777]}
                    markerPosition={location ? [location.latitude, location.longitude] : null}
                    geofence={liveCircleGeofence}
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
                  initialGeofence={liveCircleGeofence}
                  onPreview={handlePreviewGeofence}
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
                  <StatusCard location={location} alert={alert} petName={selectedPetName} />
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
                  initialGeofence={liveCircleGeofence}
                  onPreview={handlePreviewGeofence}
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
