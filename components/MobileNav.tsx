"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] border-t border-outline-variant/10">
      <Link 
        href="/" 
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-300",
          pathname === "/" ? "bg-[#28cd41]/10 text-primary dark:text-[#28cd41] scale-100" : "text-slate-400 dark:text-slate-500 scale-90"
        )}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/" ? "'FILL' 1" : "" }}>location_on</span>
        <span className="font-body font-bold text-[10px] tracking-wide mt-1">Live</span>
      </Link>
      <Link 
        href="/history" 
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-300",
          pathname === "/history" ? "bg-[#28cd41]/10 text-primary dark:text-[#28cd41] scale-100" : "text-slate-400 dark:text-slate-500 scale-90"
        )}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/history" ? "'FILL' 1" : "" }}>history</span>
        <span className="font-body font-bold text-[10px] tracking-wide mt-1">History</span>
      </Link>
      <Link 
        href="/settings" 
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl px-5 py-2 transition-all duration-300",
          pathname === "/settings" ? "bg-[#28cd41]/10 text-primary dark:text-[#28cd41] scale-100" : "text-slate-400 dark:text-slate-500 scale-90"
        )}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/settings" ? "'FILL' 1" : "" }}>security</span>
        <span className="font-body font-bold text-[10px] tracking-wide mt-1">Zones</span>
      </Link>
    </nav>
  );
}
