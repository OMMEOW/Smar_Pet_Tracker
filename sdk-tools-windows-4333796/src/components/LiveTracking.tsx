import { useState } from 'react';
import { AlertTriangle, MapPin, Satellite, Clock, Dog } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { GeofenceAlertButton } from './GeofenceAlertButton';
import { AlertBox } from './AlertBox';

// Mock pet data
const petData = {
  name: 'Max',
  latitude: 40.7128,
  longitude: -74.006,
  lastUpdated: new Date().toLocaleString(),
  satelliteCount: 12,
  geofenceRadius: 500, // meters
};

export function LiveTracking() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="relative h-full">
      {/* Sidebar */}
      <div className="absolute top-6 left-6 z-[1000] w-80">
        <DashboardCard className="backdrop-blur-sm bg-white/95">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-slate-900 mb-1">{petData.name}</h2>
              <p className="text-xs text-slate-500">Golden Retriever</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Latitude</span>
              <span className="text-sm text-slate-900">{petData.latitude.toFixed(6)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Longitude</span>
              <span className="text-sm text-slate-900">{petData.longitude.toFixed(6)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last Updated
              </span>
              <span className="text-xs text-slate-900">{petData.lastUpdated}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5" />
                Satellites
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                {petData.satelliteCount} Connected
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">GPS Signal</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 bg-emerald-500 rounded-full"
                    style={{ height: `${bar * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Geofence Alert Button */}
      <div className="absolute top-6 right-6 z-[1000]">
        <GeofenceAlertButton onClick={() => setShowAlert(!showAlert)} />
      </div>

      {/* Alert Box */}
      {showAlert && (
        <div className="absolute top-24 right-6 z-[1000]">
          <AlertBox
            title="PET HAS LEFT THE SAFE ZONE"
            message="Max has moved outside the designated geofence area. Last known location: 0.8 miles from home."
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* Map */}
      <div className="h-full w-full bg-gradient-to-br from-blue-100 via-teal-50 to-emerald-100 relative overflow-hidden">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Street-like paths */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path d="M 0 200 Q 200 150 400 200 T 800 200" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <path d="M 0 400 L 1200 350" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <path d="M 300 0 L 350 800" stroke="#94a3b8" strokeWidth="3" fill="none" />
          <path d="M 600 0 Q 580 400 600 800" stroke="#94a3b8" strokeWidth="3" fill="none" />
        </svg>

        {/* Area markers (buildings/parks) */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-emerald-200/40 rounded-lg border-2 border-emerald-300/50" />
        <div className="absolute top-1/3 right-1/4 w-32 h-20 bg-blue-200/40 rounded-lg border-2 border-blue-300/50" />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-28 bg-teal-200/40 rounded-lg border-2 border-teal-300/50" />

        {/* Geofence Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            {/* Dashed circle border */}
            <svg width="300" height="300" className="animate-pulse">
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="rgba(16, 185, 129, 0.1)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="10, 10"
              />
            </svg>
            
            {/* Pet Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative animate-bounce">
                {/* Ping effect */}
                <div className="absolute inset-0 -m-4">
                  <div className="w-20 h-20 bg-emerald-500/30 rounded-full animate-ping" />
                </div>
                
                {/* Marker */}
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-xl shadow-emerald-500/50 flex items-center justify-center border-4 border-white">
                  <Dog className="w-6 h-6 text-white" />
                </div>
                
                {/* Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="px-3 py-1 bg-white rounded-lg shadow-lg border border-slate-200">
                    <p className="text-xs text-slate-900">{petData.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <span className="text-slate-700">+</span>
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <span className="text-slate-700">−</span>
          </button>
        </div>

        {/* Coordinates Display */}
        <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            {petData.latitude.toFixed(6)}, {petData.longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}