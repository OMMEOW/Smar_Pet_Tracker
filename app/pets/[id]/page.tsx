"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Skeleton } from "boneyard-js/react";
import type { Geofence } from "@/lib/geofenceLogic";

const MapLibreMap = dynamic(() => import("@/components/MapLibreMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-container-low animate-pulse flex items-center justify-center font-headline font-bold text-slate-400">Loading Tactical Grid...</div>
});

export default function PetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { status: authStatus } = useSession();
  const router = useRouter();
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/pet/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPet(data);
        if (!editForm) setEditForm(data);
      } else {
        setError(data.error || "Failed to load pet");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    fetchPet();
    const interval = setInterval(fetchPet, 2000);
    return () => clearInterval(interval);
  }, [authStatus, id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pet/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          species: editForm.species,
          breed: editForm.breed,
          age: editForm.age,
          weight: editForm.weight,
          imageUrl: editForm.imageUrl
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPet(updated);
        setIsEditing(false);
      }
    } catch (err) {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this pet?")) return;
    try {
      const res = await fetch(`/api/pet/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      alert("Failed to delete pet");
    }
  };

  if (authStatus === "loading") {
    return <div className="h-screen w-screen bg-surface flex items-center justify-center text-on-surface">Loading Pet Details...</div>;
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-surface flex flex-col items-center justify-center text-on-surface p-10">
        <h1 className="text-3xl font-bold mb-4 font-headline text-error">{error}</h1>
        <button onClick={() => router.push("/")} className="primary-gradient text-white px-8 py-3 rounded-full font-bold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 relative">
          
          {/* Edit Modal Overlay */}
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-md">
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 md:p-12 overflow-y-auto custom-scrollbar max-h-[90vh]">
                <header className="mb-10">
                  <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Modify Identity</h2>
                  <p className="text-secondary font-medium mt-1">Update your companion's kinetic profile.</p>
                </header>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Pet Name</label>
                      <input 
                        type="text" 
                        value={editForm?.name || ""} 
                        onChange={e => setEditForm({...editForm, name: e.target.value.replace(/\b\w/g, l => l.toUpperCase())})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Profile Image URL</label>
                       <input 
                        type="text" 
                        value={editForm?.imageUrl || ""} 
                        onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Species</label>
                      <select 
                        value={editForm?.species || "Dog"} 
                        onChange={e => setEditForm({...editForm, species: e.target.value})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Breed</label>
                      <select 
                        value={editForm?.breed || ""} 
                        onChange={e => setEditForm({...editForm, breed: e.target.value})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        {editForm?.species === "Dog" && (
                          <>
                            <option value="Indie (Desi Dog)">Indie (Desi Dog)</option>
                            <option value="Labrador Retriever">Labrador Retriever</option>
                            <option value="Golden Retriever">Golden Retriever</option>
                            <option value="German Shepherd">German Shepherd</option>
                            <option value="Beagle">Beagle</option>
                            <option value="Pug">Pug</option>
                            <option value="Shih Tzu">Shih Tzu</option>
                            <option value="Rottweiler">Rottweiler</option>
                            <option value="Doberman">Doberman</option>
                            <option value="Husky">Husky</option>
                          </>
                        )}
                        {editForm?.species === "Cat" && (
                          <>
                            <option value="Indian Billi">Indian Billi</option>
                            <option value="Persian">Persian</option>
                            <option value="Siamese">Siamese</option>
                            <option value="Maine Coon">Maine Coon</option>
                            <option value="Bengal">Bengal</option>
                          </>
                        )}
                        {editForm?.species === "Other" && (
                          <option value="Mixed Breed">Mixed Breed</option>
                        )}
                        <option value="Other">Other / Not Listed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Age</label>
                      <input 
                        type="text" 
                        value={editForm?.age || ""} 
                        onChange={e => setEditForm({...editForm, age: e.target.value})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Weight</label>
                      <input 
                        type="text" 
                        value={editForm?.weight || ""} 
                        onChange={e => setEditForm({...editForm, weight: e.target.value})}
                        className="w-full bg-surface-container-high rounded-2xl px-5 py-4 border-none focus:ring-2 focus:ring-primary font-headline font-bold text-on-surface transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-8 py-4 rounded-2xl bg-surface-container-highest text-on-surface font-headline font-bold hover:bg-surface-container-high transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={saving}
                      className="flex-[2] px-8 py-4 rounded-2xl primary-gradient text-white font-headline font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {saving ? "Updating Protocol..." : "Sync Profile Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <Skeleton name="pet-header" loading={loading}>
              <div className="space-y-2">
                <span className="text-xs font-black tracking-[0.1em] text-primary uppercase mb-2 block">Pet Identification</span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tighter capitalize">{pet?.name || id}</h1>
              </div>
            </Skeleton>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setEditForm(pet);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-outline-variant/20 text-primary font-bold hover:bg-primary/5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <span className="text-sm font-headline">Edit Pet</span>
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-error/20 text-error font-bold hover:bg-error/5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
                <span className="text-sm font-headline">Remove</span>
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              <Skeleton name="pet-info" loading={loading}>
                <div className="space-y-8">
                  <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient border border-outline-variant/5">
                    <div className="aspect-square rounded-xl overflow-hidden mb-8 shadow-lg bg-surface-container-high">
                      <img 
                        alt={pet?.name} 
                        className="w-full h-full object-cover" 
                        src={pet?.imageUrl || (pet?.species?.toLowerCase() === 'cat' ? '/cat.png' : '/dog.png')} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1">Species</p>
                        <p className="text-lg font-headline font-bold text-on-surface">{pet?.species || "Canine"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1">Breed</p>
                        <p className="text-lg font-headline font-bold text-on-surface">{pet?.breed || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1">Age</p>
                        <p className="text-lg font-headline font-bold text-on-surface">{pet?.age || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1">Weight</p>
                        <p className="text-lg font-headline font-bold text-on-surface">{pet?.weight || "32 kg"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center text-on-primary">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface">Guardian Active</h4>
                        <p className="text-xs font-label text-secondary">Battery: 84% • LTE Signal: High</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Skeleton>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <Skeleton name="pet-status" loading={loading}>
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-ambient border border-outline-variant/5 flex flex-col h-full">
                  <div className="p-8 pb-4 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase">Current Status</p>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-extrabold font-headline text-on-surface">{pet?.alert ? "Alert: Outside Zone" : "Safe at Home"}</h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${pet?.alert ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                          <span className={`w-2 h-2 rounded-full ${pet?.alert ? 'bg-error' : 'bg-primary'}`}></span>
                          <span className="text-[11px] font-bold uppercase tracking-wider">{pet?.alert ? 'Outside' : 'Inside Zone'}</span>
                        </div>
                      </div>
                      {pet?.location && (
                        <p className="text-sm font-label text-secondary flex items-center gap-1 mt-2">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {pet.location.latitude.toFixed(4)}, {pet.location.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1">Last Updated</p>
                      <p className="text-sm font-headline font-bold text-on-surface">
                        {pet?.location?.timestamp ? new Date(pet.location.timestamp).toLocaleTimeString() : "Just now"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Real Live Map Container */}
                  <div className="relative h-[500px] bg-surface-container-low m-4 rounded-[2rem] overflow-hidden group border border-outline-variant/10 shadow-inner">
                    <MapLibreMap 
                        center={pet?.location ? [pet.location.latitude, pet.location.longitude] : [19.076, 72.8777]}
                        pets={pet ? [pet] : []}
                        activePetId={pet?.petId}
                        geofenceCoordinates={pet?.geofence?.coordinates}
                        activeLassoPoints={[]}
                        onLassoPointsChange={() => {}}
                        onLassoFinish={() => {}}
                    />
                  </div>

                  <div className="px-8 py-6 bg-surface-container-lowest/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1 text-center md:text-left">Steps Today</p>
                        <p className="text-xl font-headline font-extrabold text-on-surface text-center md:text-left">8,420</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-label font-bold tracking-widest text-secondary uppercase mb-1 text-center md:text-left">Active Time</p>
                        <p className="text-xl font-headline font-extrabold text-on-surface text-center md:text-left">2h 15m</p>
                      </div>
                    </div>
                    <button onClick={() => router.push("/history")} className="w-full md:w-auto primary-gradient text-on-primary px-8 py-4 rounded-full font-headline font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      View Kinetic History
                    </button>
                  </div>
                </div>
              </Skeleton>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
