"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Skeleton } from "boneyard-js/react";
import { validateIndianPhone, validateIndianPIN, validateName, capitalizeName } from "@/lib/validation";
import { INDIAN_STATES } from "@/lib/constants";

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: {
      house: "",
      locality: "",
      city: "",
      state: "Maharashtra",
      pinCode: "",
    },
    profileImage: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    router.push("/settings");
  }, [router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          setFormData({
            fullName: p.fullName || p.name || "",
            email: p.email || "",
            phoneNumber: p.phoneNumber || p.phone || "",
            address: {
              house: p.address?.house || "",
              locality: p.address?.locality || "",
              city: p.address?.city || "",
              state: p.address?.state || "Maharashtra",
              pinCode: p.address?.pinCode || "",
            },
            profileImage: p.profileImage || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setFetching(false);
      }
    };

    if (authStatus === "authenticated") {
      fetchProfile();
    }
  }, [authStatus]);

  if (authStatus === "unauthenticated") return null;

  const isSessionLoading = authStatus === "loading" || fetching;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let val = value;

    if (name === "fullName") {
      val = capitalizeName(val);
    } else if (name === "phoneNumber") {
      val = val.replace(/\D/g, '').slice(0, 10);
    } else if (name === "pinCode") {
      val = val.replace(/\D/g, '').slice(0, 6);
    }

    if (["house", "locality", "city", "state", "pinCode"].includes(name)) {
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [name]: val }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setSuccessMsg("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: "Image size should be less than 2MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.fullName)) {
      newErrors.fullName = "Please enter a valid name.";
    }
    if (formData.phoneNumber && !validateIndianPhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid 10-digit Indian mobile number.";
    }
    if (formData.address.pinCode && !validateIndianPIN(formData.address.pinCode)) {
      newErrors.pinCode = "PIN code must be exactly 6 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Profile details updated successfully.");
        // Optional: Update session if needed, but since we fetch from DB it's fine
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton name="profile-header" loading={isSessionLoading}>
              <header className="mb-12">
                <span className="text-xs font-black tracking-[0.15em] text-primary uppercase mb-2 block">Account Identity</span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight">Your Profile</h1>
              </header>
            </Skeleton>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <Skeleton name="profile-card" loading={isSessionLoading}>
                  <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high ring-4 ring-primary/10">
                            {formData.profileImage ? (
                              <img
                                alt="User profile avatar"
                                className="w-full h-full object-cover"
                                src={formData.profileImage}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                <span className="material-symbols-outlined text-4xl">person</span>
                              </div>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-md active:scale-90 transition-transform cursor-pointer">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold font-headline text-on-surface mb-1">{formData.fullName || "Guardian"}</h3>
                          <p className="text-on-surface-variant font-medium text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                            Premium Member • ₹999/month
                          </p>
                        </div>
                      </div>

                      {successMsg && (
                        <div className="bg-primary/10 text-primary p-4 rounded-xl mb-8 text-sm font-bold border border-primary/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                          <span className="material-symbols-outlined">check_circle</span>
                          {successMsg}
                        </div>
                      )}

                      {errors.submit && (
                        <div className="bg-error/10 text-error p-4 rounded-xl mb-8 text-sm font-bold border border-error/20 flex items-center gap-2">
                          <span className="material-symbols-outlined">error</span>
                          {errors.submit}
                        </div>
                      )}

                      <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Personal Info */}
                        <div>
                          <h4 className="text-lg font-bold font-headline mb-4 border-b border-surface-container-highest pb-2">Personal Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Full Name</label>
                              <input 
                                name="fullName"
                                className={`w-full bg-transparent border-0 border-b-2 ${errors.fullName ? 'border-error' : 'border-surface-container-highest focus:border-primary'} focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all`} 
                                value={formData.fullName} 
                                onChange={handleChange}
                                type="text" 
                              />
                              {errors.fullName && <p className="text-error text-xs mt-1 font-medium">{errors.fullName}</p>}
                            </div>
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Email Address</label>
                              <input 
                                name="email"
                                className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all opacity-50 cursor-not-allowed" 
                                value={formData.email} 
                                readOnly
                                type="email" 
                              />
                              <p className="text-[10px] text-secondary mt-1">Email cannot be changed.</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Phone Number</label>
                              <div className="flex items-center">
                                <span className="font-headline text-lg text-on-surface mr-2">+91</span>
                                <input 
                                  name="phoneNumber"
                                  className={`w-full bg-transparent border-0 border-b-2 ${errors.phoneNumber ? 'border-error' : 'border-surface-container-highest focus:border-primary'} focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all`} 
                                  placeholder="9876543210"
                                  value={formData.phoneNumber} 
                                  onChange={handleChange}
                                  type="tel" 
                                />
                              </div>
                              {errors.phoneNumber && <p className="text-error text-xs mt-1 font-medium">{errors.phoneNumber}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Address Info */}
                        <div>
                          <h4 className="text-lg font-bold font-headline mb-4 border-b border-surface-container-highest pb-2">Address Details</h4>
                          
                          <div className="grid grid-cols-1 gap-8 mb-6">
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">House/Flat No. & Building</label>
                              <input 
                                name="house"
                                className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" 
                                placeholder="E.g. Flat 402, Shivam Apartments"
                                value={formData.address.house} 
                                onChange={handleChange}
                                type="text" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-8 mb-6">
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">Area/Locality</label>
                              <input 
                                name="locality"
                                className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" 
                                placeholder="E.g. Andheri West"
                                value={formData.address.locality} 
                                onChange={handleChange}
                                type="text" 
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">City</label>
                              <input 
                                name="city"
                                className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all" 
                                placeholder="E.g. Mumbai"
                                value={formData.address.city} 
                                onChange={handleChange}
                                type="text" 
                              />
                            </div>

                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">State</label>
                              <select 
                                name="state"
                                className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest focus:border-primary focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all appearance-none cursor-pointer"
                                value={formData.address.state}
                                onChange={handleChange}
                              >
                                {INDIAN_STATES.map(state => (
                                  <option key={state} value={state}>{state}</option>
                                ))}
                              </select>
                            </div>

                            <div className="relative group">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1 block">PIN Code</label>
                              <input 
                                name="pinCode"
                                className={`w-full bg-transparent border-0 border-b-2 ${errors.pinCode ? 'border-error' : 'border-surface-container-highest focus:border-primary'} focus:ring-0 px-0 py-2 text-on-surface font-headline text-lg transition-all`} 
                                placeholder="400001"
                                value={formData.address.pinCode} 
                                onChange={handleChange}
                                type="text" 
                              />
                              {errors.pinCode && <p className="text-error text-xs mt-1 font-medium">{errors.pinCode}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                          <button 
                            className="px-8 py-3 rounded-full primary-gradient text-on-primary font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                                Saving Profile...
                              </>
                            ) : (
                              "Save Profile"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Skeleton>
              </div>

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
              <p className="text-xs font-medium text-secondary">© 2026 Guardian Kinetic Systems. All signals encrypted.</p>
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

