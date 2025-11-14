import { useState } from 'react';
import { Settings as SettingsIcon, MapPin, Bell, User, Shield } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';

export function Settings() {
  const [geofenceRadius, setGeofenceRadius] = useState(500);
  const [petName, setPetName] = useState('Max');
  const [petBreed, setPetBreed] = useState('Golden Retriever');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  return (
    <div className="h-full overflow-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Manage your pet tracking preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pet Details */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-900">Pet Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-2">Pet Name</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter pet name"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-2">Breed</label>
                <input
                  type="text"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter breed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Age</label>
                  <input
                    type="text"
                    defaultValue="3 years"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Weight</label>
                  <input
                    type="text"
                    defaultValue="65 lbs"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Geofence Settings */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-900">Geofence Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm text-slate-700">Safe Zone Radius</label>
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                    {geofenceRadius}m
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">100m</span>
                  <span className="text-xs text-slate-500">2000m</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  The geofence creates a virtual boundary around a designated area. You'll be notified when your pet enters or exits this zone.
                </p>
              </div>
            </div>
          </DashboardCard>

          {/* Alert Notifications */}
          <DashboardCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-slate-900">Alert Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-900">Enable Alerts</p>
                    <p className="text-xs text-slate-500">Receive geofence breach notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    alertsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      alertsEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-900">Email Alerts</p>
                    <p className="text-xs text-slate-500">Send alerts to your email</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailAlerts ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      emailAlerts ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-900">SMS Alerts</p>
                    <p className="text-xs text-slate-500">Send alerts via text message</p>
                  </div>
                </div>
                <button
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    smsAlerts ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      smsAlerts ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </DashboardCard>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
