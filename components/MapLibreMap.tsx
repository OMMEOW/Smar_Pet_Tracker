"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapLibreMapProps {
  center: [number, number]; // [lat, lng]
  markerPosition?: [number, number] | null;
  geofence?: { lat: number; lng: number; radius: number } | null;
}

export default function MapLibreMap({
  center,
  markerPosition,
  geofence,
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const dogMarker = useRef<maplibregl.Marker | null>(null);

  // Helper to create GeoJSON circle
  const createGeoJSONCircle = (center: { lat: number, lng: number }, radiusInMeters: number) => {
    const points = 64;
    const coords = [];
    const km = radiusInMeters / 1000;
    const distanceX = km / (111.32 * Math.cos(center.lat * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center.lng + x, center.lat + y]);
    }
    coords.push(coords[0]);

    return {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] }
    };
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [center[1], center[0]], 
      zoom: 14, // Slightly closer zoom for pet tracking
    });

    map.current.on('load', () => {
      // Add source for geofence immediately on load
      if (geofence) {
        const sourceData = createGeoJSONCircle({ lat: geofence.lat, lng: geofence.lng }, geofence.radius);
        map.current?.addSource('geofence-source', { type: 'geojson', data: sourceData as any });
        
        map.current?.addLayer({
          id: 'geofence-fill',
          type: 'fill',
          source: 'geofence-source',
          paint: { 
            'fill-color': '#28cd41', 
            'fill-opacity': 0.15 
          }
        });

        map.current?.addLayer({
          id: 'geofence-line',
          type: 'line',
          source: 'geofence-source',
          paint: { 
            'line-color': '#006e1a', 
            'line-width': 2.5,
            'line-dasharray': [1.5, 1.5]
          }
        });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
      dogMarker.current = null;
    };
  }, []);

  // Update map view with easeTo for smoothness
  useEffect(() => {
    if (map.current) {
      map.current.easeTo({
        center: [center[1], center[0]],
        duration: 1000,
        essential: true
      });
    }
  }, [center[0], center[1]]);

  // Update dog marker position and style
  useEffect(() => {
    if (!map.current) return;

    if (markerPosition) {
      if (!dogMarker.current) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <div class="pulse-ring"></div>
          <div class="marker-core">
            <img src="/dog.png" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuB0JkAhNjWRcWR7pkHly0EkTWpfcUfWqJYPKXtLufaBXrObP6sPOOfalir6ye5SyE_tbZKBpuYxIEt51bJzM0StdcQ6iFr5TI8s0KhgmIQDdKGSPQJ6khZTn95VXBPiB8GPSke50dNQmWXHEEr9H79jwRobrGF8ndrHGAHuNoHxp_NWMqFIBIJl0dcJtXh5x159r1DCVlE2D73W8mgoGtYfm6TG9RitlhamO-MiWzHOao6mLJ-0XCFGpMT7SKXn4PPsGpkm6M7ghWA'" />
          </div>
        `;

        dogMarker.current = new maplibregl.Marker({ element: el })
          .setLngLat([markerPosition[1], markerPosition[0]])
          .addTo(map.current);
      } else {
        dogMarker.current.setLngLat([markerPosition[1], markerPosition[0]]);
      }
    }
  }, [markerPosition]);

  // Update geofence dynamic data (radius slider change)
  useEffect(() => {
    if (!map.current || !geofence || !map.current.getStyle()) return;

    const source = map.current.getSource('geofence-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(createGeoJSONCircle({ lat: geofence.lat, lng: geofence.lng }, geofence.radius) as any);
    }
  }, [geofence?.radius, geofence?.lat, geofence?.lng]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl shadow-inner bg-[#1a1c1f]">
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
        .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo { display: none; }
        
        .marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .marker-core {
          position: relative;
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 50%;
          border: 2.5px solid #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 2;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .marker-core:hover {
          transform: scale(1.15);
        }

        .marker-core img {
          width: 90%;
          height: 90%;
          object-fit: cover;
          border-radius: 50%;
        }

        .pulse-ring {
          content: "";
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(34, 197, 94, 0.5);
          border-radius: 50%;
          animation: apple-pulse 2s infinite;
          z-index: 1;
          pointer-events: none;
        }

        @keyframes apple-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.8);
            opacity: 0;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
