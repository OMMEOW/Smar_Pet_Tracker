"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

interface HistoryEntry {
  petId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  
  const [pets, setPets] = useState<any[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    let isMounted = true;

    const fetchPetsAndHistory = async () => {
      try {
        const petRes = await fetch("/api/pet/all");
        if (petRes.status === 401) {
          signOut({ callbackUrl: "/?logout=true" });
          return;
        }
        const petData = await petRes.json();
        
        if (isMounted && Array.isArray(petData)) {
          setPets(petData);
          const defaultPetId = activePetId || (petData.length > 0 ? petData[0].petId : null);
          if (!activePetId && defaultPetId) setActivePetId(defaultPetId);

          const url = defaultPetId ? `/api/pet/history?petId=${defaultPetId}` : "/api/pet/history";
          const histRes = await fetch(url);
          const histData = await histRes.json();
          if (isMounted && Array.isArray(histData)) setHistory(histData);
        }
        if (isMounted) setLoading(false);
      } catch (err) {
        console.error("fetch error:", err);
        if (isMounted) setLoading(false);
      }
    };
    fetchPetsAndHistory();
  }, [authStatus, activePetId]);

  if (authStatus === "loading") {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Kinetic Timeline</span>
          <p className="text-secondary font-headline font-bold">Synchronizing History...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10 md:mb-16">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Timeline</p>
              <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface">Location History</h1>
              <p className="text-secondary mt-2 font-medium">Tracking the kinetic journey of your companion.</p>
            </header>
            
            {pets.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-6 mb-4 custom-scrollbar">
                {pets.map(p => (
                  <button 
                    key={p.petId}
                    onClick={() => setActivePetId(p.petId)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap border ${p.petId === activePetId ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface-container-high text-secondary border-outline-variant/20 hover:bg-surface-container-highest'}`}
                  >
                    <img src={p.imageUrl || '/dog.png'} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-bold text-sm">{p.name || 'Unknown'}</span>
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-3xl p-16 text-center shadow-sm border border-outline-variant/10">
                <span className="material-symbols-outlined text-4xl text-secondary mb-4 opacity-50">history</span>
                <h3 className="font-headline font-bold text-xl mb-2 text-on-surface">No History Found</h3>
                <p className="text-secondary text-sm max-w-md mx-auto">No location data has been recorded for this pet yet.</p>
              </div>
            ) : (
              <div className="relative pl-8 border-l border-outline-variant/30 space-y-8">
                {history.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white dark:bg-[#1a1c1f] border-2 border-primary z-10 shadow-sm" />
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface p-6 rounded-3xl shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-headline font-bold text-on-surface">
                          {new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
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
