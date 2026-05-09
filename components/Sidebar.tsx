"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { memo } from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "dashboard", label: "Dashboard" },
    { href: "/pets", icon: "pets", label: "My Pets" },
    { href: "/history", icon: "monitoring", label: "Activity" },
    { href: "/settings", icon: "settings", label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col sticky top-[72px] h-[calc(100vh-72px)] p-4 bg-white dark:bg-neutral-950 w-64 border-r dark:border-neutral-800 z-40 shrink-0">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/5 text-primary font-bold shadow-sm" 
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <span 
                className={cn(
                  "material-symbols-outlined transition-all",
                  isActive && "scale-110"
                )} 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold font-headline tracking-tight uppercase tracking-[0.05em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t dark:border-neutral-800 space-y-4">
        <Link href="/pets/add" className="w-full flex items-center justify-center gap-2 primary-gradient text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Device
        </Link>
        
        <div className="bg-surface-container-low dark:bg-neutral-900/50 p-4 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Network Status</span>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-on-surface">84% Battery</span>
             <span className="text-[10px] text-primary font-bold">ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
});
