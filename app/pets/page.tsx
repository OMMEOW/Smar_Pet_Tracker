"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { PetCard } from "@/components/PetCard";
import { Skeleton } from "boneyard-js/react";

export default function PetsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const fetchPets = async () => {
      try {
        const res = await fetch("/api/pet/all");
        const data = await res.json();
        if (res.ok) setPets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [authStatus]);

  if (authStatus === "loading") {
    return <div className="h-screen w-screen bg-surface flex items-center justify-center text-on-surface font-headline">Syncing Kinetic Network...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-black tracking-[0.15em] text-primary uppercase mb-2 block font-label">The Fleet</span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Your Kinetic Guardians</h1>
              </div>
              <Link 
                href="/pets/add" 
                className="primary-gradient text-white px-8 py-4 rounded-full font-bold font-headline shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
              >
                + Add New Pet
              </Link>
            </header>

            {pets.length === 0 && !loading ? (
              <div className="bg-surface-container-lowest rounded-3xl p-16 text-center shadow-sm border border-outline-variant/10">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <span className="material-symbols-outlined text-4xl">pets</span>
                </div>
                <h2 className="text-2xl font-bold font-headline mb-4">No pets detected.</h2>
                <p className="text-secondary max-w-sm mx-auto mb-10 font-label">Your network is currently empty. Add your first companion to begin precision tracking.</p>
                <Link href="/pets/add" className="text-primary font-bold hover:underline transition-all">Register your first device now</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(loading ? Array.from({ length: 6 }) : pets).map((pet, i) => (
                  <Skeleton key={pet?.petId || i} name="pet-card" loading={loading}>
                    <PetCard data={pet || { petId: String(i), name: "Loading...", breed: "Please wait" } as any} />
                  </Skeleton>
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
