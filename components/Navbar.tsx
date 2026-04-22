"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession, signOut } from "next-auth/react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-[#f9f9fe]/80 dark:bg-[#1a1c1f]/80 backdrop-blur-xl font-headline font-semibold tracking-tight text-sm top-0 sticky z-50 no-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex justify-between items-center w-full">
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
        {session?.user && (
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Authenticated</span>
            <span className="text-slate-700 dark:text-slate-200 text-xs">{session.user.email}</span>
          </div>
        )}
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        {session?.user ? (
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl transition-all font-bold text-xs"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        ) : (
          <Link href="/login" className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs">
            Login
          </Link>
        )}
      </div>
      </div>
    </header>
  );
}
