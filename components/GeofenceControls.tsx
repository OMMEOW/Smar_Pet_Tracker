"use client";

import { useState, useEffect } from "react";

export type Geofence = 
  | { type: "circle"; lat: number; lng: number; radius: number }
  | { type: "lasso"; coordinates: [number, number][] };

interface GeofenceControlsProps {
  mode: "circle" | "lasso";
  onModeChange: (mode: "circle" | "lasso") => void;
  initialGeofence: Geofence | null;
  onUpdate: (geofence: Geofence) => Promise<void>;
  activeLassoPoints: [number, number][];
  onLassoPointsChange: (points: [number, number][]) => void;
}

export function GeofenceControls({ 
  mode, 
  onModeChange, 
  initialGeofence, 
  onUpdate,
  activeLassoPoints,
  onLassoPointsChange
}: GeofenceControlsProps) {
  const [geofence, setGeofence] = useState<Geofence>({
    type: "circle",
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
    <>
      <div className="bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-2xl rounded-[2.5rem] p-4 md:p-6 shadow-2xl border border-outline-variant/10 pointer-events-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-black text-lg md:text-xl text-on-surface leading-tight truncate">Safe Zone</h3>
            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Perimeter</p>
          </div>
          <div className="relative w-full md:w-auto">
            <select 
              value={mode}
              onChange={(e) => onModeChange(e.target.value as "circle" | "lasso")}
              className="appearance-none w-full bg-surface-container/50 border border-outline-variant/10 text-on-surface text-[10px] font-black uppercase tracking-widest pl-3 pr-8 py-2 rounded-xl cursor-pointer hover:bg-surface-container transition-all focus:ring-0 shadow-sm"
            >
              <option value="circle">Circle</option>
              <option value="lasso">Lasso</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {mode === "circle" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-[10px] font-black uppercase text-secondary mb-2 ml-1 tracking-widest opacity-70">Latitude</label>
                  <input 
                    className="w-full bg-surface-container border border-outline-variant/10 focus:border-primary focus:ring-0 text-sm font-bold py-3 px-4 rounded-2xl transition-all text-on-surface shadow-sm" 
                    type="number" 
                    step="any"
                    value={geofence.type === "circle" ? geofence.lat : ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setGeofence(prev => ({
                        type: "circle",
                        lat: val,
                        lng: prev.type === "circle" ? prev.lng : 0,
                        radius: prev.type === "circle" ? prev.radius : 100
                      }));
                    }}
                  />
                </div>
                
                <div className="relative group">
                  <label className="block text-[10px] font-black uppercase text-secondary mb-2 ml-1 tracking-widest opacity-70">Longitude</label>
                  <input 
                    className="w-full bg-surface-container border border-outline-variant/10 focus:border-primary focus:ring-0 text-sm font-bold py-3 px-4 rounded-2xl transition-all text-on-surface shadow-sm" 
                    type="number" 
                    step="any"
                    value={geofence.type === "circle" ? geofence.lng : ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setGeofence(prev => ({
                        type: "circle",
                        lat: prev.type === "circle" ? prev.lat : 0,
                        lng: val,
                        radius: prev.type === "circle" ? prev.radius : 100
                      }));
                    }}
                  />
                </div>
              </div>
              
              <div className="relative group pt-2">
                <div className="flex justify-between items-center mb-4 px-1">
                  <label className="block text-[10px] font-black uppercase text-secondary tracking-widest opacity-70">Radius Range</label>
                  <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{geofence.type === "circle" ? geofence.radius : 0}m</span>
                </div>
                <input 
                  className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary transition-all" 
                  type="range" 
                  min="10"
                  max="2000"
                  step="10"
                  value={geofence.type === "circle" ? geofence.radius : 100}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 10;
                    setGeofence(prev => ({
                      type: "circle",
                      lat: prev.type === "circle" ? prev.lat : 0,
                      lng: prev.type === "circle" ? prev.lng : 0,
                      radius: val
                    }));
                  }}
                />
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-tighter">10m</span>
                  <span className="text-[9px] font-bold text-secondary opacity-40 uppercase tracking-tighter">2km</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2 opacity-50">gesture</span>
                <p className="text-xs font-medium text-secondary px-4 leading-relaxed">
                  Click on the map to add points.<br/>
                  <span className="text-primary font-bold">Double-click</span> or use the button below to finish.
                </p>
                
                {activeLassoPoints.length > 0 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                      {activeLassoPoints.length} Points Added
                    </span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => onLassoPointsChange(activeLassoPoints.slice(0, -1))}
                        className="text-[10px] font-bold text-secondary uppercase tracking-tighter hover:text-primary transition-colors"
                      >
                        Undo
                      </button>
                      <button 
                        onClick={() => onLassoPointsChange([])}
                        className="text-[10px] font-bold text-error uppercase tracking-tighter hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activeLassoPoints.length >= 3 && (
                <button 
                  onClick={() => {
                    setGeofence({ type: "lasso", coordinates: activeLassoPoints });
                    onLassoPointsChange([]);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all border border-primary/20"
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Finish Shape
                </button>
              )}
            </div>
          )}
          
          <button 
            onClick={handleSave}
            disabled={saving || (mode === "lasso" && geofence.type === "lasso" && geofence.coordinates.length < 3 && geofence.coordinates.length > 0)}
            className="w-full md:w-auto mt-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Geofence"}
          </button>
        </div>
      </div>
    </>
  );
}
