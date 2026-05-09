"use client";

import { useMemo, memo } from "react";

interface StatusCardProps {
  pet: any;
}

export const StatusCard = memo(function StatusCard({ pet }: StatusCardProps) {
  const { location, alert, name, petId, battery, isOnline, lastSeen } = pet;

  const lastUpdate = useMemo(() => {
    if (!lastSeen && !location?.timestamp) return "Never";
    const time = lastSeen ? new Date(lastSeen).getTime() : location?.timestamp;
    const diffMs = Date.now() - time;
    const seconds = Math.floor(diffMs / 1000);
    
    if (seconds < 1) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes > 1440) return `${Math.floor(minutes / 1440)}d ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }, [lastSeen, location?.timestamp]);

  const isActuallyOnline = isOnline !== false && location?.timestamp && (Date.now() - location.timestamp < 30000); // 30 seconds threshold

  return (
    <div className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${!isActuallyOnline ? 'bg-secondary' : (alert ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]')}`}></span>
          <span className={`text-xs font-black uppercase tracking-widest ${!isActuallyOnline ? 'text-secondary' : (alert ? 'text-red-500' : 'text-green-500')}`}>
            {!isActuallyOnline ? 'Offline' : (alert ? 'Out of Bounds' : 'Safe Zone')}
          </span>
        </div>
        <span className="text-[10px] font-black text-secondary opacity-40 uppercase tracking-widest">ID: {petId || "N/A"}</span>
      </div>
      
      <h2 className="font-headline text-3xl font-black tracking-tighter mb-4 text-on-surface">{name || "Unnamed Pet"}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-surface-container-lowest/50 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-black uppercase text-secondary tracking-[0.2em] opacity-40 mb-1">Latitude</p>
          <p className="font-headline font-black text-sm text-on-surface">
            {location ? `${location.latitude.toFixed(6)}°` : "---"}
          </p>
        </div>
        <div className="bg-surface-container-lowest/50 p-3 rounded-2xl border border-outline-variant/5">
          <p className="text-[9px] font-black uppercase text-secondary tracking-[0.2em] opacity-40 mb-1">Longitude</p>
          <p className="font-headline font-black text-sm text-on-surface">
            {location ? `${location.longitude.toFixed(6)}°` : "---"}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-[11px] text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">history</span>
          <span className="font-bold opacity-60 uppercase text-[9px] tracking-wider">{lastUpdate}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" title="Battery Status">
            <span className={`material-symbols-outlined text-[16px] ${battery <= 20 ? 'text-red-500' : 'text-green-500'}`}>
              {battery <= 20 ? 'battery_alert' : 'battery_full'}
            </span>
            <span className={`font-black tracking-tighter ${battery <= 20 ? 'text-red-500' : 'text-primary'}`}>{battery ?? 0}%</span>
          </div>
          <div className="flex items-center gap-1.5" title="GPS Signal Strength">
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span className="font-bold opacity-60 uppercase text-[9px] tracking-wider">{isActuallyOnline ? 'Live' : 'Lost'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});
