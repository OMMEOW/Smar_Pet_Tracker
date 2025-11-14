"use client";

import { Bell } from "lucide-react";

interface GeofenceAlertButtonProps {
  onClick: () => void;
  alertCount?: number;
}

export function GeofenceAlertButton({
  onClick,
  alertCount = 0,
}: GeofenceAlertButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-gray-900/50 border border-slate-100 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all"
    >
      <div className="relative">
        <Bell className="w-5 h-5 text-slate-700 dark:text-gray-300" />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
      <span className="text-sm text-slate-900 dark:text-white">
        Geofence Alerts
      </span>
      {alertCount > 0 && (
        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs">
          {alertCount}
        </span>
      )}
    </button>
  );
}

