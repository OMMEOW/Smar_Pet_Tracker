"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { db, ref, onValue } from "@/lib/firebase";
import AlertBox from "@/components/AlertBox";
import { DashboardCard } from "@/components/DashboardCard";
import { GeofenceAlertButton } from "@/components/GeofenceAlertButton";
import { MapPin, Satellite, Clock } from "lucide-react";
import { LatLngExpression } from "leaflet";

// FIX: Dynamic loading to prevent Map re-initialization errors
const MapWrapper = dynamic(() => import("../components/MapWrapper"), {
  ssr: false,
});

interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface Geofence {
  lat: number;
  lng: number;
  radius: number;
}

export default function HomePage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [alert, setAlert] = useState(false);
  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlertBox, setShowAlertBox] = useState(false);

  // ---------- REALTIME FIREBASE LISTENERS ----------
  useEffect(() => {
    const locRef = ref(db, "pet/location");
    const alertRef = ref(db, "pet/alert");
    const geofenceRef = ref(db, "pet/geofence");

    const unsubLoc = onValue(locRef, (snap) => {
      const data = snap.val();
      if (data) {
        setLocation(data);
        setLoading(false);
      }
    });

    const unsubAlert = onValue(alertRef, (snap) => {
      const a = snap.val() === true;
      setAlert(a);
      if (a) setShowAlertBox(true);
    });

    const unsubGeo = onValue(geofenceRef, (snap) => {
      const data = snap.val();
      if (data) setGeofence(data);
    });

    return () => {
      unsubLoc();
      unsubAlert();
      unsubGeo();
    };
  }, []);

  // ----------- DEFAULT STATIC MAP BEFORE FIREBASE DATA -----------
  const defaultCenter: LatLngExpression = [19.044992, 72.871277]; // This matches your UI screenshot
  const mapCenter: LatLngExpression = location
    ? [location.latitude, location.longitude]
    : defaultCenter;

  const formatTimestamp = (t: number) => {
    if (!t) return "N/A";
    return new Date(t).toLocaleString();
  };

  // ------------ DISTANCE CALCULATOR ------------
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const alertMessage = () => {
    if (!location || !geofence) return "Pet moved outside the geofence.";
    const d = calculateDistance(
      location.latitude,
      location.longitude,
      geofence.lat,
      geofence.lng
    );
    return `Pet moved ${d.toFixed(1)}m from the safe zone center.`;
  };

  return (
    <div className="relative h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">

      {/* ---------- SIDEBAR ---------- */}
      <div className="absolute top-6 left-6 z-[1000] w-80">
        <DashboardCard className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1 font-semibold">
                Pet Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Real-time tracking
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Skeleton Loader */}
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3">

              {/* Latitude */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-gray-700">
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  Latitude
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">
                  {location?.latitude.toFixed(6)}
                </span>
              </div>

              {/* Longitude */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-gray-700">
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  Longitude
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">
                  {location?.longitude.toFixed(6)}
                </span>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Last Updated
                </span>
                <span className="text-xs text-slate-900 dark:text-white">
                  {formatTimestamp(location?.timestamp || 0)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5" />
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                    alert
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {alert ? "Alert Active" : "Safe"}
                </span>
              </div>
            </div>
          )}

          {/* Geofence Info */}
          {geofence && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-gray-400">
                  Geofence Radius
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-semibold">
                  {geofence.radius}m
                </span>
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ---------- ALERT BUTTON ---------- */}
      {alert && (
        <div className="absolute top-6 right-6 z-[1000]">
          <GeofenceAlertButton
            onClick={() => setShowAlertBox(!showAlertBox)}
            alertCount={alert ? 1 : 0}
          />
        </div>
      )}

      {/* ---------- ALERT BOX ---------- */}
      <AlertBox
        show={showAlertBox && alert}
        message={alertMessage()}
        onClose={() => setShowAlertBox(false)}
      />

      {/* ---------- FULLSCREEN MAP ---------- */}
      <div className="h-full w-full">
        <MapWrapper
          center={mapCenter}
          zoom={15}
          markerPosition={
            location ? [location.latitude, location.longitude] : null
          }
          geofence={geofence}
          height="100%"
          autoCenter={true}
        />
      </div>
    </div>
  );
}
