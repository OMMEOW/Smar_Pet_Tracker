"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

// Dynamically load leaflet components on client only
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);

export default function MapWrapper() {
  // Default static center
  const [center, setCenter] = useState([19.0760, 72.8777]); // Mumbai
  const [markerPos, setMarkerPos] = useState(null);
  const mounted = useRef(false);

  // Firebase listener
  useEffect(() => {
    const locationRef = dbRef(database, "pet/location");

    const unsubscribe = onValue(locationRef, (snap) => {
      const d = snap.val();
      if (d?.lat && d?.lng) {
        const newPos = [d.lat, d.lng];
        setCenter(newPos);
        setMarkerPos(newPos);
      }
    });

    return () => unsubscribe();
  }, []);

  // Prevent Leaflet double-initialization error ✔
  if (!mounted.current) {
    mounted.current = true;

    return (
      <div className="w-full h-[600px] rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {markerPos && <Marker position={markerPos} />}
        </MapContainer>
      </div>
    );
  }

  // After first render NEVER re-mount the map
  return <div className="w-full h-[600px]" />;
}
