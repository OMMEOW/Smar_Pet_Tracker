"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

interface HistoryEntry {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/pet/history");
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
        setLoading(false);
      } catch (err) {
        console.error("fetch error:", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Timeline</p>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Location History</h1>
              <p className="text-secondary mt-2 font-medium">Tracking the kinetic journey of your companion.</p>
            </header>

            {loading ? (
              <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="relative pl-8 border-l border-outline-variant/30 space-y-8">
                {history.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#1a1c1f] border-2 border-primary z-10 shadow-sm" />
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface p-6 rounded-3xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-headline font-bold text-on-surface">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        {i === 0 && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-lg uppercase">Latest</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div>
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Position</p>
                            <p className="font-headline font-semibold text-on-surface">
                                {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                            </p>
                         </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
