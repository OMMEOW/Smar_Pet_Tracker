"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Skeleton } from "boneyard-js/react";

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  if (authStatus === "unauthenticated") return null;

  const isSessionLoading = authStatus === "loading";

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Editorial Header */}
            <Skeleton name="profile-header" loading={isSessionLoading}>
              <header className="mb-12">
                <span className="text-xs font-black tracking-[0.15em] text-primary uppercase mb-2 block">Account Identity</span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Your Profile</h1>
              </header>
            </Skeleton>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-8">
                <Skeleton name="profile-card" loading={isSessionLoading}>
                  <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high">
                            <img 
                              alt="User profile avatar" 
                              className="w-full h-full object-cover" 
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNVMRXvLyTkPGplgMrq1C-SXGihWKmW3U1kijBOe9Da-eVZDJlnD-EXdYIvBCIul1PM-iSH33rvuzNvnAz4i7BgpIXWV9Ujga44kEhrhq--muCL0oKCmlZ9fFdDDhTY43PmW33HHcszF01fHQqZG_rlbpHYowrKFbMXWQGiTD7UHIl2xEGov8STJvsg_Jkkvj3kXDGq3daIPljsiIIRiFIrFE8u60iSvdOue89WxZmiNwdnq_6W67mbir-RFJ_9LuH3gPHgb2iMJY" 
                            />
                          </div>
                          <button className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-md active:scale-90 transition-transform">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">{session?.user?.name || "Guardian"}</h3>
                          <p className="text-on-surface-variant font-medium text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                            Premium Member since 2024
                          </p>
                        </div>
                      </div>

                      {/* Editable Section */}
                      <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative group">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Full Name</label>
                            <input className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" defaultValue={session?.user?.name || ""} type="text" />
                          </div>
                          <div className="relative group">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Email Address</label>
                            <input className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" defaultValue={session?.user?.email || ""} type="email" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="relative group">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Phone Number</label>
                            <input className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" defaultValue="+1 (555) 012-3456" type="tel" />
                          </div>
                          <div className="relative group">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Timezone</label>
                            <select className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all appearance-none">
                              <option>Pacific Time (PT)</option>
                              <option>Eastern Time (ET)</option>
                              <option>Central Time (CT)</option>
                            </select>
                          </div>
                        </div>
                        <div className="pt-6 flex justify-end">
                          <button className="px-8 py-3 rounded-full primary-gradient text-on-primary font-bold shadow-xl shadow-primary/20 active:scale-95 transition-transform" type="button">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Skeleton>
              </div>

              {/* Side Stats / Info */}
              <div className="lg:col-span-4 space-y-6">
                <Skeleton name="profile-sidebar" loading={isSessionLoading}>
                  <div className="space-y-6">
                    <div className="bg-surface-container rounded-xl p-8">
                      <h4 className="text-sm font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                        Security Center
                      </h4>
                      <div className="space-y-4">
                        <button className="w-full flex items-center justify-between group">
                          <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">Change Password</span>
                          <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between group">
                          <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">Two-Factor Auth</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-surface-container rounded-xl p-8">
                      <h4 className="text-sm font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>watch</span>
                        Devices (1)
                      </h4>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant">pets</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold font-headline">Apollo's Kinetic</p>
                            <p className="text-[10px] text-secondary">Battery: 84% • Connected</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => signOut({ callbackUrl: "/?logout=true" })}
                      className="w-full p-6 rounded-xl bg-error/5 border border-error/10 flex items-center justify-center gap-3 text-error font-bold hover:bg-error hover:text-on-primary transition-all group active:scale-95"
                    >
                      <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">logout</span>
                      <span>Sign Out of Kinetic Guardian</span>
                    </button>
                  </div>
                </Skeleton>
              </div>
            </div>

            <footer className="mt-24 pt-12 border-t border-surface-container-highest flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <p className="text-xs font-medium text-secondary">© 2024 Guardian Kinetic Systems. All signals encrypted.</p>
              <div className="flex gap-8">
                <button className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Privacy</button>
                <button className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Terms</button>
                <button className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Support</button>
              </div>
            </footer>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
