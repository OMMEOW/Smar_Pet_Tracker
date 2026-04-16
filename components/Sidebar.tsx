"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-[72px] h-[calc(100vh-72px)] p-6 gap-8 bg-surface-container-low dark:bg-[#2e3034] w-64 border-r-0 font-body font-medium text-xs uppercase tracking-widest z-40">
      <div className="flex flex-col gap-2">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:translate-x-1",
            pathname === "/" 
              ? "bg-surface-container-lowest dark:bg-[#1a1c1f] text-primary dark:text-[#28cd41] shadow-md" 
              : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/" ? "'FILL' 1" : "" }}>map</span>
          <span>Live Map</span>
        </Link>
        <Link 
          href="/history" 
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:translate-x-1",
            pathname === "/history" 
              ? "bg-surface-container-lowest dark:bg-[#1a1c1f] text-primary dark:text-[#28cd41] shadow-md" 
              : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/history" ? "'FILL' 1" : "" }}>monitoring</span>
          <span>Activity</span>
        </Link>
        <Link 
          href="/settings" 
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:translate-x-1",
            pathname === "/settings" 
              ? "bg-surface-container-lowest dark:bg-[#1a1c1f] text-primary dark:text-[#28cd41] shadow-md" 
              : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/settings" ? "'FILL' 1" : "" }}>radar</span>
          <span>Safe Zones</span>
        </Link>
      </div>

      <div className="mt-auto pb-4">
        <div className="bg-surface-container-lowest dark:bg-inverse-surface p-4 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">battery_charging_full</span>
            </div>
            <div>
              <p className="text-[10px] text-on-secondary-container font-bold">BATTERY</p>
              <p className="text-sm font-bold normal-case text-on-surface">84% Charged</p>
            </div>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div className="bg-primary w-[84%] h-full transition-all duration-1000"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
