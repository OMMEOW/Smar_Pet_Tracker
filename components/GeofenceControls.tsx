"use client";

import { useState, useEffect } from "react";

interface Geofence {
  lat: number;
  lng: number;
  radius: number;
}

interface GeofenceControlsProps {
  initialGeofence: Geofence | null;
  onUpdate: (geofence: Geofence) => Promise<void>;
}

export function GeofenceControls({ initialGeofence, onUpdate }: GeofenceControlsProps) {
  const [geofence, setGeofence] = useState<Geofence>({
    lat: 19.123456,
    lng: 72.987654,
    radius: 100
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialGeofence) {
      setGeofence(initialGeofence);
    }
  }, [initialGeofence]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(geofence);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-outline-variant/10 pointer-events-auto">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary">potted_plant</span>
        <h3 className="font-headline font-bold text-lg text-on-surface">Safe Zone</h3>
      </div>
      
      <div className="space-y-5">
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase text-secondary mb-1 ml-1 tracking-widest">Center Latitude</label>
          <input 
            className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 text-sm font-semibold py-2 px-1 transition-all text-on-surface" 
            type="number" 
            step="any"
            value={geofence.lat}
            onChange={(e) => setGeofence({ ...geofence, lat: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase text-secondary mb-1 ml-1 tracking-widest">Center Longitude</label>
          <input 
            className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 text-sm font-semibold py-2 px-1 transition-all text-on-surface" 
            type="number" 
            step="any"
            value={geofence.lng}
            onChange={(e) => setGeofence({ ...geofence, lng: parseFloat(e.target.value) || 0 })}
          />
        </div>
        
        <div className="relative group">
          <label className="block text-[10px] font-bold uppercase text-secondary mb-1 ml-1 tracking-widest">Radius (Meters)</label>
          <input 
            className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 text-sm font-semibold py-2 px-1 transition-all text-on-surface" 
            type="number" 
            value={geofence.radius}
            onChange={(e) => setGeofence({ ...geofence, radius: parseInt(e.target.value) || 0 })}
          />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Geofence"}
        </button>
      </div>
    </div>
  );
}
