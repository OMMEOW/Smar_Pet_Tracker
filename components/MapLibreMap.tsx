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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [center[1], center[0]], // MapLibre uses [lng, lat]
      zoom: 12,
    });

    map.current.on('load', () => {
      updateGeofence();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: [center[1], center[0]],
        speed: 0.8
      });
    }
  }, [center[0], center[1]]);

  // Update dog marker
  useEffect(() => {
    if (!map.current) return;

    if (markerPosition) {
      if (!dogMarker.current) {
        // Create custom element for dog marker
        const el = document.createElement('div');
        el.className = 'dog-marker-container';
        el.innerHTML = `
          <div class="relative group">
            <div class="w-12 h-12 bg-white dark:bg-[#2e3034] rounded-full shadow-2xl flex items-center justify-center p-1 border-2 border-[#006e1a] animate-pulse">
              <div class="w-full h-full rounded-full overflow-hidden">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0JkAhNjWRcWR7pkHly0EkTWpfcUfWqJYPKXtLufaBXrObP6sPOOfalir6ye5SyE_tbZKBpuYxIEt51bJzM0StdcQ6iFr5TI8s0KhgmIQDdKGSPQJ6khZTn95VXBPiB8GPSke50dNQmWXHEEr9H79jwRobrGF8ndrHGAHuNoHxp_NWMqFIBIJl0dcJtXh5x159r1DCVlE2D73W8mgoGtYfm6TG9RitlhamO-MiWzHOao6mLJ-0XCFGpMT7SKXn4PPsGpkm6M7ghWA" class="w-full h-full object-cover" />
              </div>
            </div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-[#006e1a] border-2 border-white rounded-full shadow-lg"></div>
          </div>
        `;

        dogMarker.current = new maplibregl.Marker({ element: el })
          .setLngLat([markerPosition[1], markerPosition[0]])
          .addTo(map.current);
      } else {
        dogMarker.current.setLngLat([markerPosition[1], markerPosition[0]]);
      }
    } else if (dogMarker.current) {
      dogMarker.current.remove();
      dogMarker.current = null;
    }
  }, [markerPosition]);

  // Update geofence
  const updateGeofence = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const sourceId = 'geofence-source';
    const fillLayerId = 'geofence-fill';
    const lineLayerId = 'geofence-line';

    if (!geofence) {
      if (map.current.getLayer(fillLayerId)) map.current.removeLayer(fillLayerId);
      if (map.current.getLayer(lineLayerId)) map.current.removeLayer(lineLayerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
      return;
    }

    // Create a GeoJSON for the geofence circle
    const points = 64;
    const coords = [];
    const km = geofence.radius / 1000;
    const distanceX = km / (111.32 * Math.cos(geofence.lat * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([geofence.lng + x, geofence.lat + y]);
    }
    coords.push(coords[0]);

    const geojsonData: any = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] }
    };

    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojsonData);
    } else {
      map.current.addSource(sourceId, { type: 'geojson', data: geojsonData });
      map.current.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': '#28cd41', 'fill-opacity': 0.1 }
      });
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: { 'line-color': '#006e1a', 'line-width': 2, 'line-dasharray': [2, 2] }
      });
    }
  };

  useEffect(() => {
    updateGeofence();
  }, [geofence]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl group">
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
        .maplibregl-ctrl-attrib { display: none; }
        .dog-marker-container { cursor: pointer; }
      `}</style>
    </div>
  );
}
