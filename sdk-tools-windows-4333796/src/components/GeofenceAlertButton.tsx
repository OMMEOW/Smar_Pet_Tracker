import { Bell } from 'lucide-react';

interface GeofenceAlertButtonProps {
  onClick: () => void;
}

export function GeofenceAlertButton({ onClick }: GeofenceAlertButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-5 py-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:scale-105 transition-all"
    >
      <div className="relative">
        <Bell className="w-5 h-5 text-slate-700" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </div>
      <span className="text-sm text-slate-900">Geofence Alerts</span>
      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">1</span>
    </button>
  );
}
