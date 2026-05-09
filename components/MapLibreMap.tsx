import { useEffect, useRef, memo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapLibreMapProps {
  center: [number, number]; 
  pets: any[]; 
  activePetId?: string | null;
  geofenceCoordinates?: [number, number][];
  activeLassoPoints: [number, number][];
  onLassoPointsChange: (points: [number, number][]) => void;
  onLassoFinish?: (coords: [number, number][]) => void;
  onPetSelect?: (petId: string) => void;
}

const MapLibreMap = memo(function MapLibreMap({
  center,
  pets,
  activePetId,
  activeLassoPoints,
  onLassoPointsChange,
  onPetSelect
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const isMapLoaded = useRef(false);

  // Preload icons
  useEffect(() => {
    const icons = ["/icons/cat-marker.png", "/icons/dog-marker.png"];
    icons.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Use a ref for activeLassoPoints to access the latest value in the click listener
  const lassoPointsRef = useRef<[number, number][]>([]);
  lassoPointsRef.current = activeLassoPoints;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [center[1], center[0]], 
      zoom: 15,
      maxZoom: 20,
      fadeDuration: 0 // Performance
    });

    map.current.on('load', () => {
      isMapLoaded.current = true;
      if (!map.current) return;

      map.current.addSource("pet-geofence", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [] },
          properties: {}
        }
      });

      map.current.addLayer({
        id: "pet-geofence-fill",
        type: "fill",
        source: "pet-geofence",
        paint: { "fill-color": "#00ff66", "fill-opacity": 0.1 }
      });

      map.current.addLayer({
        id: "pet-geofence-border",
        type: "line",
        source: "pet-geofence",
        paint: { "line-color": "#00ff66", "line-width": 2 }
      });
      
      updateGeofenceSource();
    });

    map.current.on('click', (e) => {
      const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      onLassoPointsChange([...lassoPointsRef.current, newPoint]);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isMapLoaded.current = false;
      }
    };
  }, []); // Initialize only once

  const updateGeofenceSource = () => {
    if (!map.current || !isMapLoaded.current) return;
    const source = map.current.getSource("pet-geofence") as maplibregl.GeoJSONSource;
    if (!source) return;

    const activePet = pets.find(p => p.petId === activePetId);
    let points = lassoPointsRef.current.length > 0 
      ? lassoPointsRef.current 
      : (activePet?.geofence?.coordinates || []);

    if (points.length >= 3) {
      const closedPoints = [...points];
      if (closedPoints[0][0] !== closedPoints[closedPoints.length - 1][0] ||
          closedPoints[0][1] !== closedPoints[closedPoints.length - 1][1]) {
        closedPoints.push(closedPoints[0]);
      }
      source.setData({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [closedPoints] },
        properties: {}
      });
    } else {
      source.setData({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [] },
        properties: {}
      });
    }
  };

  useEffect(() => {
    updateGeofenceSource();
  }, [activePetId, activeLassoPoints]); // Remove pets from dependency if not needed for geofence

  // Sync Markers and Camera
  useEffect(() => {
    if (!map.current || !isMapLoaded.current) return;

    const currentPetIds = new Set(pets.map(p => p.petId));
    
    // Cleanup removed pets
    Object.keys(markersRef.current).forEach(id => {
      if (!currentPetIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    pets.forEach(pet => {
      if (!pet.location) return;
      const { latitude, longitude } = pet.location;
      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      const isActive = pet.petId === activePetId;
      let marker = markersRef.current[pet.petId];
      
      if (!marker) {
        const markerEl = document.createElement("div");
        markerEl.className = "pet-marker";
        const img = document.createElement("img");
        img.src = pet.species?.toLowerCase() === 'cat' ? "/icons/cat-marker.png" : "/icons/dog-marker.png";
        img.className = "pet-marker-img";
        if (isActive) {
          img.style.border = "4px solid #ef4444";
          img.style.borderRadius = "50%";
        }
        markerEl.appendChild(img);
        markerEl.onclick = (e) => {
          e.stopPropagation();
          if (onPetSelect) onPetSelect(pet.petId);
        };
        marker = new maplibregl.Marker({ element: markerEl, anchor: "center" })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);
        markersRef.current[pet.petId] = marker;
      } else {
        marker.setLngLat([longitude, latitude]);
        const img = marker.getElement().querySelector('img');
        if (img) {
          if (isActive) {
            img.style.border = "4px solid #ef4444";
            img.style.borderRadius = "50%";
          } else {
            img.style.border = "none";
          }
        }
      }

      if (isActive) {
        map.current!.easeTo({
          center: [longitude, latitude],
          duration: 500 // Faster easing
        });
      }
    });
  }, [pets, activePetId]);

  return (
    <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx global>{`
        .pet-marker { width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }
        .pet-marker-img { width: 64px; height: 64px; object-fit: contain; transition: all 0.3s ease; }
        .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo { display: none; }
      `}</style>
    </div>
  );
});

export default MapLibreMap;
