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

  const items = [
    { href: "/", icon: "dashboard", label: "Dashboard" },
    { href: "/pets", icon: "pets", label: "Pets" },
    { href: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 flex justify-around items-center px-4 py-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-xl rounded-full border border-outline-variant/10">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-neutral-500 scale-100"
            )}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
            <span className="font-headline font-bold text-[10px] tracking-wide mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
