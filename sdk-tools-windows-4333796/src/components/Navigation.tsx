import { MapPin, Clock, Settings as SettingsIcon } from 'lucide-react';

type Screen = 'live' | 'history' | 'settings';

interface NavigationProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export function Navigation({ activeScreen, onScreenChange }: NavigationProps) {
  const navItems = [
    { id: 'live' as Screen, label: 'Live Tracking', icon: MapPin },
    { id: 'history' as Screen, label: 'History', icon: Clock },
    { id: 'settings' as Screen, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-slate-900">Pet Tracker</h1>
              <p className="text-xs text-slate-500">Real-time GPS Monitoring</p>
            </div>
          </div>

          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onScreenChange(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
