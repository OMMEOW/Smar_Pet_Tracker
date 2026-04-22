"use client";

interface Alert {
  message: string;
  time: string;
  type: "safe" | "danger" | "warning";
}

interface AlertsSectionProps {
  alerts?: Alert[];
}

export function AlertsSection({ alerts = [] }: AlertsSectionProps) {
  // Default alerts for visualization if none provided
  const displayAlerts = alerts.length > 0 ? alerts : [
    { message: "Inside geofence", time: "Just now", type: "safe" as const },
  ];

  return (
    <div className="flex-1 bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-2xl rounded-3xl p-4 md:p-6 shadow-xl border border-outline-variant/10 pointer-events-auto overflow-hidden flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-bold text-base md:text-lg lg:text-xl text-on-surface">Recent Alerts</h3>
        <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-1 rounded-lg">LIVE</span>
      </div>
      
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {displayAlerts.map((alert, i) => (
          <div key={i} className={`flex gap-4 items-start ${i > 0 ? 'opacity-60' : ''}`}>
            <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
              alert.type === 'danger' ? 'bg-tertiary ring-4 ring-tertiary/10' : 
              alert.type === 'safe' ? 'bg-primary ring-4 ring-primary/10' : 'bg-secondary'
            }`}></div>
            <div>
              <p className="text-xs font-bold text-on-surface">{alert.message}</p>
              <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-tighter">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
