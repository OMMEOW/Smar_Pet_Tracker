"use client";

import { useState, memo } from "react";

interface GeofenceControlsProps {
  initialCoordinates: [number, number][];
  onUpdate: (coordinates: [number, number][]) => Promise<void>;
  activeLassoPoints: [number, number][];
  onLassoPointsChange: (points: [number, number][]) => void;
}

export const GeofenceControls = memo(function GeofenceControls({ 
  onUpdate,
  activeLassoPoints, 
  onLassoPointsChange
}: GeofenceControlsProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (activeLassoPoints.length < 3) return;
    setSaving(true);
    try {
      await onUpdate(activeLassoPoints);
      onLassoPointsChange([]); // Clear drawing points after save
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-2xl rounded-[2.5rem] p-4 md:p-6 shadow-2xl border border-outline-variant/10 pointer-events-auto">
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
        <div className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-black text-lg md:text-xl text-on-surface leading-tight truncate">Geofence Lasso</h3>
          <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.2em]">Dedicated Secure Perimeter</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="text-center py-6 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-4xl text-secondary mb-2 opacity-50">gesture</span>
          <p className="text-xs font-medium text-secondary px-4 leading-relaxed">
            Click on the map to define the safe zone.<br/>
            <span className="text-primary font-bold">Double-click</span> to close the shape.
          </p>
          
          {activeLassoPoints.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-tighter">
                {activeLassoPoints.length} Points Defined
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={() => onLassoPointsChange(activeLassoPoints.slice(0, -1))}
                  className="text-[10px] font-bold text-secondary uppercase tracking-tighter hover:text-primary transition-colors"
                >
                  Undo Point
                </button>
                <button 
                  onClick={() => onLassoPointsChange([])}
                  className="text-[10px] font-bold text-error uppercase tracking-tighter hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={saving || activeLassoPoints.length < 3}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
          {saving ? "Saving Perimeter..." : "Apply Geofence"}
        </button>
      </div>
    </div>
  );
});
