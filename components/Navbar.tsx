"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Clock, Settings as SettingsIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Live Tracking", icon: MapPin },
    { href: "/history", label: "History", icon: Clock },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-semibold">
                Pet Tracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Real-time GPS Monitoring
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

