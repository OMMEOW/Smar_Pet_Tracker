"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Skeleton } from "boneyard-js/react";
import useSWR, { mutate } from "swr";
import { validateIndianPhone, validateIndianPIN, validateName, capitalizeName } from "@/lib/validation";
import { INDIAN_STATES } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then(res => res.json());

type SettingsSection = "account" | "notifications" | "tracking" | "security" | "appearance" | "danger";

export default function SettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Fetch all settings
  const { data: settings, error, isLoading } = useSWR(
    authStatus === "authenticated" ? "/api/settings" : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [localSettings, setLocalSettings] = useState<any>(null);

  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (updatedFields: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const newData = await res.json();
        setLocalSettings(newData);
        mutate("/api/settings", newData, false);
        showToast("Settings updated successfully.");
      } else {
        showToast("Failed to update settings.", "error");
      }
    } catch (err) {
      showToast("Network error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDangerAction = async (action: string) => {
    const confirmMsg = action === "DESTROY_ACCOUNT" 
      ? "CRITICAL: This will permanently delete your account and all pet data. Are you absolutely sure?" 
      : "Are you sure you want to perform this irreversible action?";
    
    if (!window.confirm(confirmMsg)) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        showToast("Action performed successfully.");
        if (action === "DESTROY_ACCOUNT") {
          signOut({ callbackUrl: "/" });
        }
      } else {
        showToast("Action failed.", "error");
      }
    } catch (err) {
      showToast("Network error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (path: string, value: boolean) => {
    const keys = path.split('.');
    const updated = { ...localSettings };
    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalSettings(updated);
    handleUpdate({ [keys[0]]: updated[keys[0]] });
  };

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    const updated = { ...localSettings };
    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalSettings(updated);
  };

  if (authStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (isLoading || !localSettings) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-secondary font-headline font-bold uppercase tracking-widest text-[10px]">Loading System Config...</p>
      </div>
    );
  }

  const sections = [
    { id: "account", label: "Account", icon: "person" },
    { id: "tracking", label: "Device & Tracking", icon: "track_changes" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "security", label: "Security", icon: "security" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "danger", label: "Danger Zone", icon: "warning", color: "text-red-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          {toast && (
            <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm ${toast.type === 'success' ? 'bg-primary' : 'bg-red-500'} text-white animate-in fade-in slide-in-from-top-4`}>
              <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
              {toast.message}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Settings Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="sticky top-28 space-y-1">
                <h1 className="text-2xl font-black font-headline tracking-tighter mb-6 px-4">Settings</h1>
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id as SettingsSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-high'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${s.color || ''}`}>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Settings Content */}
            <div className="flex-1 max-w-2xl">
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 border border-outline-variant/10 shadow-[0_30px_60px_rgba(0,0,0,0.02)]">
                {activeSection === "account" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter mb-1">Account Information</h2>
                      <p className="text-xs text-secondary font-medium">Manage your personal identity and contact details.</p>
                    </header>

                    <div className="flex items-center gap-6 p-6 bg-surface-container-low rounded-3xl">
                      <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container-high ring-4 ring-primary/5">
                          {localSettings.profileImage ? (
                            <img src={localSettings.profileImage} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary"><span className="material-symbols-outlined text-4xl">person</span></div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-md transform hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => handleUpdate({ profileImage: reader.result as string });
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{localSettings.fullName || "User Name"}</h3>
                        <p className="text-xs text-secondary">{localSettings.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Full Name" value={localSettings.fullName} onChange={v => handleInputChange("fullName", v)} />
                      <Input label="Phone Number" value={localSettings.phoneNumber} onChange={v => handleInputChange("phoneNumber", v)} prefix="+91" />
                    </div>

                    <div className="space-y-6">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-secondary opacity-60">Address Details</h3>
                      <Input label="House / Building" value={localSettings.address?.house} onChange={v => handleInputChange("address.house", v)} />
                      <div className="grid grid-cols-2 gap-6">
                        <Input label="Locality" value={localSettings.address?.locality} onChange={v => handleInputChange("address.locality", v)} />
                        <Input label="City" value={localSettings.address?.city} onChange={v => handleInputChange("address.city", v)} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">State</label>
                          <select 
                            value={localSettings.address?.state} 
                            onChange={e => handleInputChange("address.state", e.target.value)}
                            className="w-full bg-surface-container-low border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none"
                          >
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <Input label="PIN Code" value={localSettings.address?.pinCode} onChange={v => handleInputChange("address.pinCode", v)} />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUpdate({ fullName: localSettings.fullName, phoneNumber: localSettings.phoneNumber, address: localSettings.address })}
                      disabled={isSaving}
                      className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Save Account Changes"}
                    </button>
                  </div>
                )}

                {activeSection === "notifications" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter mb-1">Notifications</h2>
                      <p className="text-xs text-secondary font-medium">Configure how and when you want to be alerted.</p>
                    </header>

                    <div className="space-y-1">
                      <Toggle 
                        label="Telegram Breach Alerts" 
                        desc="Instant alerts on your Telegram bot when a pet leaves its safe zone." 
                        checked={localSettings.notificationSettings?.telegram} 
                        onChange={v => handleToggle("notificationSettings.telegram", v)} 
                      />
                      <Toggle 
                        label="Push Notifications" 
                        desc="System-level push alerts for critical device events." 
                        checked={localSettings.notificationSettings?.push} 
                        onChange={v => handleToggle("notificationSettings.push", v)} 
                      />
                      <Toggle 
                        label="Alert Sound" 
                        desc="Play a high-pitched alarm sound on the dashboard during a breach." 
                        checked={localSettings.notificationSettings?.sound} 
                        onChange={v => handleToggle("notificationSettings.sound", v)} 
                      />
                      <Toggle 
                        label="Heart-rate Alerts" 
                        desc="Notify if pet's heart rate falls outside healthy range (50-140 BPM)." 
                        checked={localSettings.notificationSettings?.heartRate} 
                        onChange={v => handleToggle("notificationSettings.heartRate", v)} 
                      />
                      <Toggle 
                        label="Device Offline Warning" 
                        desc="Alert if a device loses signal for more than 30 seconds." 
                        checked={localSettings.notificationSettings?.offline} 
                        onChange={v => handleToggle("notificationSettings.offline", v)} 
                      />
                    </div>
                  </div>
                )}

                {activeSection === "tracking" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter mb-1">Device & Tracking</h2>
                      <p className="text-xs text-secondary font-medium">Fine-tune the real-time telemetry engine performance.</p>
                    </header>

                    <div className="p-6 bg-surface-container-low rounded-3xl flex items-center justify-between border border-primary/10">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                           <span className="material-symbols-outlined text-primary">router</span>
                         </div>
                         <div>
                           <p className="text-[10px] font-black uppercase text-secondary tracking-widest opacity-60">Master Device ID</p>
                           <p className="font-bold text-lg">{localSettings.primaryDeviceId || "GK-ALPHA-01"}</p>
                         </div>
                       </div>
                       <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Unpair</button>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                         <label className="text-sm font-bold text-on-surface">Telemetry Refresh Interval</label>
                         <p className="text-xs text-secondary mb-3">Lower values increase precision but consume more battery.</p>
                         <div className="flex items-center gap-4">
                           <input 
                             type="range" min="1" max="10" step="1" 
                             value={localSettings.trackingSettings?.telemetryInterval}
                             onChange={e => handleInputChange("trackingSettings.telemetryInterval", parseInt(e.target.value))}
                             onMouseUp={() => handleUpdate({ trackingSettings: localSettings.trackingSettings })}
                             className="flex-1 accent-primary h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer"
                           />
                           <span className="w-16 text-center font-black text-primary bg-primary/10 py-2 rounded-xl text-sm">{localSettings.trackingSettings?.telemetryInterval}s</span>
                         </div>
                       </div>

                       <Toggle 
                         label="Map Auto-Follow" 
                         desc="Automatically pan the map to center on the active pet when it moves." 
                         checked={localSettings.trackingSettings?.autoFollow} 
                         onChange={v => handleToggle("trackingSettings.autoFollow", v)} 
                       />
                    </div>
                  </div>
                )}

                {activeSection === "security" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter mb-1">Security & Access</h2>
                      <p className="text-xs text-secondary font-medium">Protect your account and manage active login sessions.</p>
                    </header>

                    <div className="space-y-4">
                       <button className="w-full flex items-center justify-between p-6 bg-surface-container-low rounded-3xl hover:bg-surface-container-high transition-colors group border border-outline-variant/10">
                         <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary">password</span>
                            <span className="font-bold text-sm">Update Account Password</span>
                         </div>
                         <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">chevron_right</span>
                       </button>

                       <button className="w-full flex items-center justify-between p-6 bg-surface-container-low rounded-3xl hover:bg-surface-container-high transition-colors group border border-outline-variant/10">
                         <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary">phonelink_lock</span>
                            <span className="font-bold text-sm">Active Device Sessions</span>
                         </div>
                         <span className="text-[10px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-black">2 ACTIVE</span>
                       </button>

                       <button 
                         onClick={() => signOut({ callbackUrl: "/?logout=true" })}
                         className="w-full p-6 border-2 border-red-500/10 rounded-3xl flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all"
                       >
                         <span className="material-symbols-outlined">logout</span>
                         Logout All Other Sessions
                       </button>
                    </div>
                  </div>
                )}

                {activeSection === "appearance" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter mb-1">Appearance</h2>
                      <p className="text-xs text-secondary font-medium">Personalize the visual interface to suit your needs.</p>
                    </header>

                    <div className="grid grid-cols-3 gap-4">
                       <ThemeOption 
                        label="Light" 
                        active={localSettings.preferredTheme === 'light'} 
                        icon="light_mode" 
                        onClick={() => handleUpdate({ preferredTheme: 'light' })} 
                       />
                       <ThemeOption 
                        label="Dark" 
                        active={localSettings.preferredTheme === 'dark'} 
                        icon="dark_mode" 
                        onClick={() => handleUpdate({ preferredTheme: 'dark' })} 
                       />
                       <ThemeOption 
                        label="System" 
                        active={localSettings.preferredTheme === 'system'} 
                        icon="settings_brightness" 
                        onClick={() => handleUpdate({ preferredTheme: 'system' })} 
                       />
                    </div>

                    <div className="space-y-2 pt-4">
                      <Toggle 
                        label="Fluid Animations" 
                        desc="Enable smooth transitions and map animations (recommended)." 
                        checked={localSettings.appearanceSettings?.animationEnabled} 
                        onChange={v => handleToggle("appearanceSettings.animationEnabled", v)} 
                      />
                      <Toggle 
                        label="Compact Dashboard" 
                        desc="Reduce whitespace for a more information-dense interface." 
                        checked={localSettings.appearanceSettings?.compactMode} 
                        onChange={v => handleToggle("appearanceSettings.compactMode", v)} 
                      />
                    </div>
                  </div>
                )}

                {activeSection === "danger" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <header>
                      <h2 className="text-2xl font-black font-headline tracking-tighter text-red-500 mb-1">Danger Zone</h2>
                      <p className="text-xs text-secondary font-medium">Irreversible actions that affect your data and devices.</p>
                    </header>

                    <div className="space-y-4">
                      <DangerAction 
                        label="Clear Telemetry History" 
                        desc="Wipe all past GPS and health data. This cannot be undone." 
                        btnLabel="Wipe Data"
                        onClick={() => handleDangerAction("WIPE_HISTORY")}
                      />
                      <DangerAction 
                        label="Unpair All Devices" 
                        desc="Disconnect all pet trackers from this account immediately." 
                        btnLabel="Unpair All"
                        onClick={() => handleDangerAction("UNPAIR_ALL")}
                      />
                      <DangerAction 
                        label="Delete Account Forever" 
                        desc="Permanently delete your profile, pets, and all associated data." 
                        btnLabel="Destroy Account"
                        isCritical
                        onClick={() => handleDangerAction("DESTROY_ACCOUNT")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function Input({ label, value, onChange, prefix, type = "text" }: { label: string, value: string, onChange: (v: string) => void, prefix?: string, type?: string }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-4 font-bold text-secondary text-sm">{prefix}</span>}
        <input 
          type={type} 
          value={value || ""} 
          onChange={e => onChange(e.target.value)}
          className={`w-full bg-surface-container-low border-0 rounded-2xl ${prefix ? 'pl-12' : 'px-4'} py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all`} 
        />
      </div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-6 group">
      <div className="flex-1 pr-8">
        <h4 className="font-bold text-sm text-on-surface mb-0.5">{label}</h4>
        <p className="text-[11px] text-secondary font-medium leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary' : 'bg-surface-container-highest'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

function ThemeOption({ label, active, icon, onClick }: { label: string, active: boolean, icon: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${active ? 'bg-primary/5 border-primary text-primary' : 'bg-surface-container-low border-transparent text-secondary hover:bg-surface-container-high'}`}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function DangerAction({ label, desc, btnLabel, isCritical, onClick }: { label: string, desc: string, btnLabel: string, isCritical?: boolean, onClick: () => void }) {
  return (
    <div className="p-6 bg-red-500/[0.03] border border-red-500/10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-sm text-on-surface mb-0.5">{label}</h4>
        <p className="text-[11px] text-secondary font-medium">{desc}</p>
      </div>
      <button 
        onClick={onClick}
        className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isCritical ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95' : 'text-red-500 hover:bg-red-500/10'}`}
      >
        {btnLabel}
      </button>
    </div>
  );
}
