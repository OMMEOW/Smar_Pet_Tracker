"use client";

import { useEffect, useState } from "react";
import { ref, onValue, set } from "@/lib/firebase";
import { database } from "@/lib/firebase";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/Button";
import MapWrapper from "@/components/MapWrapper";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  MapPin,
} from "lucide-react";
import { LatLngExpression } from "leaflet";

interface Geofence {
  lat: number;
  lng: number;
  radius: number;
}

export default function SettingsPage() {
  const [geofence, setGeofence] = useState<Geofence>({
    lat: 19.123456,
    lng: 72.987654,
    radius: 100,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const geofenceRef = ref(database, "pet/geofence");
    const unsubscribe = onValue(geofenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGeofence(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    // Validation
    if (
      isNaN(geofence.lat) ||
      isNaN(geofence.lng) ||
      isNaN(geofence.radius)
    ) {
      setError("All fields must be valid numbers");
      setSaving(false);
      return;
    }

    if (geofence.lat < -90 || geofence.lat > 90) {
      setError("Latitude must be between -90 and 90");
      setSaving(false);
      return;
    }

    if (geofence.lng < -180 || geofence.lng > 180) {
      setError("Longitude must be between -180 and 180");
      setSaving(false);
      return;
    }

    if (geofence.radius <= 0) {
      setError("Radius must be greater than 0");
      setSaving(false);
      return;
    }

    try {
      const geofenceRef = ref(database, "pet/geofence");
      await set(geofenceRef, geofence);
      setSuccess("Geofence settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save geofence settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the geofence?")) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const geofenceRef = ref(database, "pet/geofence");
      await set(geofenceRef, null);
      setSuccess("Geofence deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete geofence");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const mapCenter: LatLngExpression = [geofence.lat, geofence.lng];

  return (
    <div className="h-[calc(100vh-80px)] overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-semibold">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Manage your pet tracking preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Geofence Settings */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-semibold">
                Geofence Settings
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2 font-medium">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={geofence.lat}
                    onChange={(e) =>
                      setGeofence({
                        ...geofence,
                        lat: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                    min="-90"
                    max="90"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-gray-300 mb-2 font-medium">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={geofence.lng}
                    onChange={(e) =>
                      setGeofence({
                        ...geofence,
                        lng: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                    min="-180"
                    max="180"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-slate-700 dark:text-gray-300 font-medium">
                    Safe Zone Radius
                  </label>
                  <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                    {geofence.radius}m
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={geofence.radius}
                  onChange={(e) =>
                    setGeofence({
                      ...geofence,
                      radius: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    100m
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    2000m
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDelete}
                  disabled={saving || loading}
                >
                  Delete
                </Button>
                <Button type="submit" disabled={saving || loading}>
                  {saving ? "Saving..." : "Save Geofence"}
                </Button>
              </div>
            </form>
          </DashboardCard>

          {/* Preview */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-semibold">
                Preview
              </h2>
            </div>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">
                  Loading map...
                </div>
              </div>
            ) : (
              <MapWrapper
                center={mapCenter}
                zoom={15}
                geofence={geofence}
                height="400px"
              />
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
