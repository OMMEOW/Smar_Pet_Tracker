import { MapPin, Calendar } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';

// Mock history data
const historyData = [
  {
    id: 1,
    time: 'Today, 2:45 PM',
    latitude: 40.7128,
    longitude: -74.006,
    location: 'Central Park, New York',
  },
  {
    id: 2,
    time: 'Today, 1:30 PM',
    latitude: 40.7589,
    longitude: -73.9851,
    location: 'Times Square, New York',
  },
  {
    id: 3,
    time: 'Today, 11:15 AM',
    latitude: 40.7484,
    longitude: -73.9857,
    location: 'Empire State Building',
  },
  {
    id: 4,
    time: 'Today, 9:00 AM',
    latitude: 40.7614,
    longitude: -73.9776,
    location: 'Rockefeller Center',
  },
  {
    id: 5,
    time: 'Yesterday, 5:20 PM',
    latitude: 40.7411,
    longitude: -74.0042,
    location: 'Hudson River Park',
  },
  {
    id: 6,
    time: 'Yesterday, 3:10 PM',
    latitude: 40.7580,
    longitude: -73.9855,
    location: 'Broadway Theater District',
  },
];

export function HistoryTimeline() {
  return (
    <div className="h-full overflow-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Location History</h1>
            <p className="text-sm text-slate-500">Timeline of Max's past locations</p>
          </div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-blue-500" />

          <div className="space-y-4">
            {historyData.map((item, index) => (
              <div key={item.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-6 w-10 h-10 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </div>

                <DashboardCard className={index === 0 ? 'ring-2 ring-emerald-500' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-slate-900">{item.time}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                            Latest
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 mb-3">{item.location}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Latitude</p>
                          <p className="text-sm text-slate-900">{item.latitude.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Longitude</p>
                          <p className="text-sm text-slate-900">{item.longitude.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="secondary" size="sm">
                      View on Map
                    </Button>
                  </div>
                </DashboardCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
