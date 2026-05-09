"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "boneyard-js/react";
import { Bell, CheckCircle, AlertTriangle, Clock, MapPin } from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
  const { data: session, status: authStatus } = useSession();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const fetchData = async () => {
      try {
        const [alertsRes, petsRes] = await Promise.all([
          fetch("/api/alerts"),
          fetch("/api/pet/all")
        ]);
        const [alertsData, petsData] = await Promise.all([
          alertsRes.json(),
          petsRes.json()
        ]);
        
        if (Array.isArray(alertsData)) setAlerts(alertsData);
        if (Array.isArray(petsData)) setPets(petsData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [authStatus]);

  if (authStatus === "loading") return null;

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#121417]">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <header className="mb-12">
              <h1 className="font-headline font-black text-4xl lg:text-5xl text-on-surface mb-2 tracking-tighter">Security Log</h1>
              <p className="text-secondary font-medium">Monitor all geofence breaches and system alerts.</p>
            </header>

            <Skeleton name="alerts-list" loading={isLoading}>
              <div className="grid gap-6">
                {alerts.length === 0 ? (
                  <div className="bg-surface-container-lowest rounded-[2.5rem] p-16 text-center border border-dashed border-outline-variant/10">
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                       <Bell className="text-primary/20 w-10 h-10" />
                    </div>
                    <h3 className="font-headline font-bold text-2xl text-on-surface">System Secure</h3>
                    <p className="text-secondary max-w-sm mx-auto mt-2 text-sm leading-relaxed">No security breaches detected. All pets are currently within their designated safe zones.</p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const pet = pets.find(p => p.petId === alert.petId);
                    const isActive = alert.status === 'ACTIVE';
                    
                    return (
                      <div 
                        key={alert._id}
                        className={`group relative overflow-hidden bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl border border-outline-variant/10 transition-all hover:scale-[1.01] ${isActive ? 'ring-2 ring-error/20' : ''}`}
                      >
                        <div className="flex items-start gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-error text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
                            {isActive ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-headline font-black text-xl text-on-surface">
                                {pet?.name || 'Pet'} 
                                <span className={`ml-3 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${isActive ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                  {alert.status}
                                </span>
                              </h3>
                              <span className="text-[10px] font-bold text-secondary flex items-center gap-1 opacity-60">
                                <Clock size={12} />
                                {new Date(alert.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-sm font-bold text-on-surface/80 leading-relaxed mb-4">{alert.message}</p>
                            
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-outline-variant/5">
                               <div className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest">
                                  <MapPin size={14} className="opacity-40" />
                                  <span>Device ID: {alert.petId}</span>
                               </div>
                               {alert.resolvedAt && (
                                 <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <CheckCircle size={14} className="opacity-40" />
                                    <span>Resolved: {new Date(alert.resolvedAt).toLocaleTimeString()}</span>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Skeleton>
          </div>
        </main>
      </div>
    </div>
  );
}
