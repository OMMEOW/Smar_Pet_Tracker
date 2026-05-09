"use client";

import { useMemo, memo } from "react";

interface HeartRateCardProps {
  bpm: number;
  lastUpdated?: string | Date;
}

export const HeartRateCard = memo(function HeartRateCard({ bpm, lastUpdated }: HeartRateCardProps) {
  const isNoData = !bpm || bpm === 0;
  const isHealthy = bpm >= 50 && bpm <= 140;
  
  const statusText = useMemo(() => {
    if (isNoData) return "NO DATA";
    if (bpm < 50) return "LOW";
    if (bpm > 140) return "HIGH";
    return "NORMAL";
  }, [bpm, isNoData]);

  const statusColor = useMemo(() => {
    if (isNoData) return "text-secondary opacity-50";
    if (bpm < 50 || bpm > 140) return "text-red-500";
    return "text-green-500";
  }, [bpm, isNoData]);

  return (
    <div className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 shadow-xl border border-outline-variant/10 flex flex-col gap-4 transition-all hover:shadow-2xl hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNoData ? 'bg-secondary/10' : (isHealthy ? 'bg-green-500/10' : 'bg-red-500/10')}`}>
            <span className={`material-symbols-outlined font-bold ${isNoData ? 'text-secondary/40' : (isHealthy ? 'text-green-500' : 'text-red-500')} ${!isNoData ? 'animate-pulse' : ''}`}>
              favorite
            </span>
          </div>
          <h3 className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-secondary opacity-60">Heart Rate</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[9px] font-black tracking-widest ${statusColor} bg-opacity-5 border-opacity-20`}>
          {statusText}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl md:text-6xl font-black font-headline tracking-tighter text-primary">
          {isNoData ? "--" : bpm}
        </span>
        <span className="text-xs font-black text-secondary opacity-40 tracking-widest">BPM</span>
      </div>

      <div className="mt-2 pt-4 border-t border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${!isNoData ? 'bg-green-500 animate-pulse' : 'bg-secondary/30'}`}></div>
          <span className="text-[10px] font-bold text-secondary opacity-60">Real-time sync</span>
        </div>
        {lastUpdated && (
          <span className="text-[9px] font-medium text-secondary opacity-40">
            Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
});
