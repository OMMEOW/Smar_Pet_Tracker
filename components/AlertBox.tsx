"use client";

import { AlertTriangle, X } from "lucide-react";

interface AlertBoxProps {
  show: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  onViewLocation?: () => void;
}

export default function AlertBox({
  show,
  title = "PET HAS LEFT THE SAFE ZONE",
  message = "Pet has moved outside the designated geofence area.",
  onClose,
  onViewLocation,
}: AlertBoxProps) {
  if (!show) return null;

  return (
    <div className="fixed top-24 right-6 z-[1000] animate-in slide-in-from-top-5">
      <div className="w-96 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl shadow-red-500/50 p-6 border-2 border-red-400">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <p className="text-sm text-white/90 mb-4">{message}</p>

        <div className="flex gap-2">
          {onViewLocation && (
            <button
              onClick={onViewLocation}
              className="flex-1 px-4 py-2 bg-white text-red-600 rounded-lg text-sm hover:bg-white/90 transition-colors font-medium"
            >
              View Location
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

