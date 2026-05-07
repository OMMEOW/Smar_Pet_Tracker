"use client";

import { useMemo } from "react";

interface StatusCardProps {
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
    satellites?: number;
    hdop?: number;
    distance?: number;
    pulseBpm?: number;
    pulseRaw?: number;
  } | null;
  alert: boolean;
  petName?: string;
}

export function StatusCard({ location, alert, petName = "Apollo" }: StatusCardProps) {
  const lastUpdate = useMemo(() => {
    if (!location?.timestamp) return "Never";
    const minutes = Math.floor((Date.now() - location.timestamp) / 60000);
    if (minutes < 1) return "Just now";
    return `${minutes}m ago`;
  }, [location?.timestamp]);

  return (
    <div className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${alert ? 'bg-tertiary shadow-[0_0_8px_rgba(192,0,10,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(0,110,26,0.5)]'}`}></span>
          <span className={`text-xs font-bold uppercase tracking-widest ${alert ? 'text-tertiary' : 'text-primary'}`}>
            {alert ? 'Out of Bounds' : 'Inside Geofence'}
          </span>
        </div>
        <span className="text-[10px] font-medium text-secondary opacity-60">ID: GK-8821</span>
      </div>
      
      <h2 className="font-headline text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-on-surface">{petName}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Latitude</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {location ? location.latitude.toFixed(6) : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Longitude</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {location ? location.longitude.toFixed(6) : "---"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Pulse</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {typeof location?.pulseBpm === "number" && location.pulseBpm > 0 ? `${location.pulseBpm} bpm` : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Distance</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {typeof location?.distance === "number" ? `${location.distance.toFixed(1)}m` : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Sats</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {typeof location?.satellites === "number" ? location.satellites : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">HDOP</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {typeof location?.hdop === "number" ? location.hdop.toFixed(2) : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 dark:bg-on-surface/5 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-bold uppercase text-secondary tracking-wider mb-1">Pulse Raw</p>
          <p className="font-headline font-semibold text-sm text-on-surface">
            {typeof location?.pulseRaw === "number" ? location.pulseRaw : "---"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[11px] text-secondary">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span>Last update: {lastUpdate}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">signal_cellular_alt</span>
          <span>Signal: Strong</span>
        </div>
      </div>
    </div>
  );
}
