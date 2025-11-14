import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LiveTracking } from './components/LiveTracking';
import { HistoryTimeline } from './components/HistoryTimeline';
import { Settings } from './components/Settings';

type Screen = 'live' | 'history' | 'settings';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('live');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      
      <main className="h-[calc(100vh-80px)]">
        {activeScreen === 'live' && <LiveTracking />}
        {activeScreen === 'history' && <HistoryTimeline />}
        {activeScreen === 'settings' && <Settings />}
      </main>
    </div>
  );
}
