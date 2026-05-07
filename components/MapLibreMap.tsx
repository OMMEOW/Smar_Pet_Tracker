"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapLibreMapProps {
  center: [number, number]; 
  markerPosition?: [number, number] | null;
  geofence?: any | null;
  mode: "circle" | "lasso";
  activeLassoPoints: [number, number][];
  onLassoPointsChange: (points: [number, number][]) => void;
  onLassoFinish?: (coords: [number, number][]) => void;
  petImageUrl?: string;
}

export default function MapLibreMap({
  center,
  markerPosition,
  geofence,
  mode,
  activeLassoPoints,
  onLassoPointsChange,
  onLassoFinish,
  petImageUrl,
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const dogMarker = useRef<maplibregl.Marker | null>(null);
  const lastAutoFitKey = useRef<string | null>(null);

  // Task 1 & 2: Helper to create GeoJSON circle with smooth 64 points
  const createGeoJSONCircle = (center: [number, number], radiusInMeters: number) => {
    const [lng, lat] = center;
    const points = 64;
    const coords = [];
    const km = radiusInMeters / 1000;
    
    const distanceX = km / (111.32 * Math.cos(lat * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([lng + x, lat + y]);
    }
    coords.push(coords[0]);

    return {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] },
      properties: {}
    };
  };

  const updateLassoSource = (points: [number, number][]) => {
    if (!map.current) return;
    const source = map.current.getSource('lasso-geofence') as maplibregl.GeoJSONSource;
    if (!source) return;

    if (points.length < 3) {
      if (geofence?.type === 'lasso' && geofence.coordinates?.length > 0) {
        const closedPoints = [...geofence.coordinates, geofence.coordinates[0]];
        source.setData({
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [closedPoints] },
          properties: {}
        } as any);
        return;
      }

      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const closedPoints = [...points, points[0]];
    source.setData({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [closedPoints] },
      properties: {}
    } as any);
  };

  const extendBoundsWithCircle = (
    bounds: maplibregl.LngLatBounds,
    circle: { lat: number; lng: number; radius: number }
  ) => {
    const radiusKm = circle.radius / 1000;
    const lngOffset = radiusKm / (111.32 * Math.cos(circle.lat * Math.PI / 180));
    const latOffset = radiusKm / 110.574;

    bounds.extend([circle.lng - lngOffset, circle.lat - latOffset]);
    bounds.extend([circle.lng + lngOffset, circle.lat + latOffset]);
  };

  const extendBoundsWithGeofence = (bounds: maplibregl.LngLatBounds) => {
    if (!geofence) return;

    if (geofence.type === "circle") {
      extendBoundsWithCircle(bounds, geofence);
      return;
    }

    if (geofence.type === "lasso" && geofence.coordinates?.length > 0) {
      geofence.coordinates.forEach(([lng, lat]: [number, number]) => {
        bounds.extend([lng, lat]);
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [center[1], center[0]], 
      zoom: 18,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.addSource('geofence', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addSource('lasso-geofence', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current.addLayer({
        id: 'lasso-fill',
        type: 'fill',
        source: 'lasso-geofence',
        paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.15 }
      });
      map.current.addLayer({
        id: 'lasso-outline',
        type: 'line',
        source: 'lasso-geofence',
        paint: { 'line-color': '#22c55e', 'line-width': 2 }
      });

      map.current.addLayer({
        id: 'geofence-fill',
        type: 'fill',
        source: 'geofence',
        paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.15 }
      });
      map.current.addLayer({
        id: 'geofence-outline',
        type: 'line',
        source: 'geofence',
        paint: { 'line-color': '#22c55e', 'line-width': 2 }
      });

      map.current.addLayer({
        id: 'lasso-vertices',
        type: 'circle',
        source: 'lasso-geofence',
        paint: {
          'circle-radius': 4,
          'circle-color': '#22c55e',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Handle resize events
      const handleResize = () => {
        map.current?.resize();
      };
      window.addEventListener('resize', handleResize);
      
      // Force a resize after mount to handle layout shifts
      setTimeout(() => {
        map.current?.resize();
      }, 500);

      return () => {
        window.removeEventListener('resize', handleResize);
        map.current?.remove();
        map.current = null;
        dogMarker.current = null;
      };
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (mode !== 'lasso') return;
      const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      onLassoPointsChange([...activeLassoPoints, newPoint]);
    };

    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      if (mode !== 'lasso' || activeLassoPoints.length < 3) return;
      e.preventDefault();
      if (onLassoFinish) onLassoFinish(activeLassoPoints);
    };

    map.current.on('click', handleClick);
    map.current.on('dblclick', handleDblClick);
    
    return () => {
      map.current?.off('click', handleClick);
      map.current?.off('dblclick', handleDblClick);
    };
  }, [mode, activeLassoPoints, onLassoPointsChange, onLassoFinish]);

  useEffect(() => {
    updateLassoSource(activeLassoPoints);
  }, [activeLassoPoints]);

  useEffect(() => {
    if (map.current) {
      if (geofence && markerPosition) return;

      map.current.easeTo({
        center: [center[1], center[0]],
        duration: 1000,
        essential: true
      });
    }
  }, [center[0], center[1]]);

  useEffect(() => {
    if (!map.current || !markerPosition || !geofence) return;

    const nextAutoFitKey =
      geofence.type === "circle"
        ? `${markerPosition[0].toFixed(6)},${markerPosition[1].toFixed(6)},circle,${geofence.lat.toFixed(6)},${geofence.lng.toFixed(6)}`
        : `${markerPosition[0].toFixed(6)},${markerPosition[1].toFixed(6)},lasso,${JSON.stringify(geofence.coordinates || [])}`;

    if (lastAutoFitKey.current === nextAutoFitKey) return;

    const fitMapToLocationAndGeofence = () => {
      if (!map.current) return;

      const bounds = new maplibregl.LngLatBounds(
        [markerPosition[1], markerPosition[0]],
        [markerPosition[1], markerPosition[0]]
      );

      extendBoundsWithGeofence(bounds);

      map.current.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 70, right: 70 },
        maxZoom: 20,
        duration: 1000,
      });
      lastAutoFitKey.current = nextAutoFitKey;
    };

    if (map.current.loaded()) {
      fitMapToLocationAndGeofence();
    } else {
      map.current.once("load", fitMapToLocationAndGeofence);
    }
  }, [markerPosition, geofence]);

  useEffect(() => {
    if (!map.current) return;

    if (markerPosition) {
      if (!dogMarker.current) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <div class="pulse-ring"></div>
          <div class="marker-core">
            <img src="${petImageUrl || '/dog.png'}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuB0JkAhNjWRcWR7pkHly0EkTWpfcUfWqJYPKXtLufaBXrObP6sPOOfalir6ye5SyE_tbZKBpuYxIEt51bJzM0StdcQ6iFr5TI8s0KhgmIQDdKGSPQJ6khZTn95VXBPiB8GPSke50dNQmWXHEEr9H79jwRobrGF8ndrHGAHuNoHxp_NWMqFIBIJl0dcJtXh5x159r1DCVlE2D73W8mgoGtYfm6TG9RitlhamO-MiWzHOao6mLJ-0XCFGpMT7SKXn4PPsGpkm6M7ghWA'" />
          </div>
        `;

        dogMarker.current = new maplibregl.Marker({ element: el })
          .setLngLat([markerPosition[1], markerPosition[0]])
          .addTo(map.current);
      } else {
        dogMarker.current.setLngLat([markerPosition[1], markerPosition[0]]);
        const img = dogMarker.current.getElement().querySelector('img');
        if (img) img.src = petImageUrl || '/dog.png';
      }
    }
  }, [markerPosition, petImageUrl]);

  useEffect(() => {
    if (!map.current) return;

    const updateMapSources = () => {
      const circleSource = map.current?.getSource('geofence') as maplibregl.GeoJSONSource;
      const lassoSource = map.current?.getSource('lasso-geofence') as maplibregl.GeoJSONSource;

      if (!circleSource || !lassoSource) return;

      circleSource.setData({ type: 'FeatureCollection', features: [] });
      
      if (activeLassoPoints.length === 0) {
        lassoSource.setData({ type: 'FeatureCollection', features: [] });
      }

      if (geofence?.type === 'circle') {
        circleSource.setData(createGeoJSONCircle([geofence.lng, geofence.lat], geofence.radius) as any);
      }

      if (activeLassoPoints.length === 0 && geofence?.type === 'lasso' && geofence.coordinates?.length > 0) {
        const closedPoints = [...geofence.coordinates, geofence.coordinates[0]];
        lassoSource.setData({
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [closedPoints] },
          properties: {}
        } as any);
      }
    };

    if (map.current.loaded()) {
      updateMapSources();
    } else {
      map.current.once('load', updateMapSources);
    }
  }, [geofence, mode, activeLassoPoints]);

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
