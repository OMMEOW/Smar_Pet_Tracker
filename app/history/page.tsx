"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "@/lib/firebase";
import { database } from "@/lib/firebase";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/Button";
import MapWrapper from "@/components/MapWrapper";
import { MapPin, Calendar } from "lucide-react";
import { LatLngExpression } from "leaflet";

interface HistoryEntry {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface ModalMapProps {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number } | null;
}

function ModalMap({ isOpen, onClose, location }: ModalMapProps) {
  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4">
        <div className="p-6 border-b border-slate-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            View on Map
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors text-slate-600 dark:text-gray-400"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <MapWrapper
            center={[location.lat, location.lng]}
            zoom={15}
            markerPosition={[location.lat, location.lng]}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const historyRef = ref(database, "pet/history");
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and sort by timestamp (newest first)
        const entries = Object.values(data) as HistoryEntry[];
        entries.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(entries);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const handleViewOnMap = (entry: HistoryEntry) => {
    setSelectedLocation({
      lat: entry.latitude,
      lng: entry.longitude,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-semibold">
              Location History
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Timeline of past locations
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-500 dark:text-gray-400">
              Loading history...
            </div>
          </div>
        ) : history.length === 0 ? (
          <DashboardCard>
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No history data available
            </div>
          </DashboardCard>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-blue-500" />

            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-10 h-10 bg-white dark:bg-gray-800 rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>

                  <DashboardCard
                    className={index === 0 ? "ring-2 ring-emerald-500" : ""}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-900 dark:text-white font-medium">
                            {formatTime(item.timestamp)}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                              Latitude
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white font-mono">
                              {item.latitude.toFixed(6)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mb-1">
                              Longitude
                            </p>
                            <p className="text-sm text-slate-900 dark:text-white font-mono">
                              {item.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewOnMap(item)}
                      >
                        View on Map
                      </Button>
                    </div>
                  </DashboardCard>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ModalMap
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={selectedLocation}
      />
    </div>
  );
}
