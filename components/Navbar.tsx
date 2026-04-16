"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-[#f9f9fe]/80 dark:bg-[#1a1c1f]/80 backdrop-blur-xl font-headline font-semibold tracking-tight text-sm top-0 sticky z-50 no-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex justify-between items-center w-full px-6 py-4 mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-headline font-extrabold text-xl tracking-tighter text-slate-900 dark:text-slate-50">
          Guardian Kinetic
        </Link>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <nav className="flex gap-6">
          <Link 
            href="/" 
            className={cn(
              "transition-colors px-2 py-1 rounded-lg",
              pathname === "/" ? "text-primary dark:text-[#28cd41] font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Dashboard
          </Link>
          <Link 
            href="/history" 
            className={cn(
              "transition-colors px-2 py-1 rounded-lg",
              pathname === "/history" ? "text-primary dark:text-[#28cd41] font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            History
          </Link>
          <Link 
            href="/settings" 
            className={cn(
              "transition-colors px-2 py-1 rounded-lg",
              pathname === "/settings" ? "text-primary dark:text-[#28cd41] font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            Settings
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link href="/settings" className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full">
          <span className="material-symbols-outlined">settings</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden ml-2 border border-outline-variant/20">
          <img 
            alt="User profile" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOKIE9biwmszQZWFqW-3mqjmJA0rjRKJDtWfcj0QpHFnVYwOJJE7AOav2rESgPe4yk9jxbEpQVHBSORNBAkufMKO4bvIKyeKhWFM71guM9jZaVrDn9j-9NFwBc9Y7SAtaa0Htx83BiZCkFUUGnZ4d1-CWvSfy-49nLTQkm-hFXj8czc09wmZY-Oq3pKILs5Ud3eDJztb9WMpZKtiAg93ztkeDoy_ZQUOSSE5Aaj-3P-5g9za4KckDZ3Lb1vQjlPjPIQin1OV_TC1o" 
          />
        </div>
      </div>
    </header>
  );
}
