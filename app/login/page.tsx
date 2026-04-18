"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Side: Editorial Canvas (Hero) */}
      <section className="hidden md:flex w-7/12 relative bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Guardian Kinetic Protection" 
            className="w-full h-full object-cover opacity-90" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxsr59Hy3GkXzQDCGSOA-QcdOrAvYXakAjzA2r-iiU6_U7ZOguY8uHvv1Jtneo0zg770fEV7-sIAeKyyhHga7fqQuHnPqy3_N40KRllM5bFejiybh7k7OkrHWzqm_DCfLEXpotE5-OLCiVlRtlWZIN-uN7rBp3IJExBG9kkXb_d-qcKWQ1GyUl9u9ZagDj04ksk-lQc_fIp0jpdXl6_OT84JBuvgWpno77qI1ezPi3S9-pmL4j3sQfd9wG5VQrTkMUEAvkWw3OaUo"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low/40 to-transparent"></div>
        </div>
        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full text-on-surface">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-headline font-extrabold tracking-tighter">Guardian Kinetic</span>
          </div>
          <div className="max-w-xl">
            <p className="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4">Precision Tracking</p>
            <h1 className="font-headline text-6xl font-extrabold tracking-tighter leading-none mb-8">
              Security as an<br /><span className="text-primary italic">Art Form.</span>
            </h1>
            <p className="text-secondary text-lg leading-relaxed max-w-md font-body">
              Access your guardian dashboard and monitor every movement with surgical precision and effortless clarity.
            </p>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <span className="font-headline text-3xl font-bold">99.9%</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-medium">Uptime Guarantee</span>
            </div>
            <div className="w-px h-12 bg-outline-variant/20"></div>
            <div className="flex flex-col">
              <span className="font-headline text-3xl font-bold">GPS+</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-medium">Satellite Precision</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Interaction Canvas (Login Form) */}
      <main className="w-full md:w-5/12 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-surface z-20">
        <div className="w-full max-w-md">
          {/* Mobile Header Only */}
          <div className="md:hidden mb-12">
            <span className="text-xl font-headline font-extrabold tracking-tighter text-on-surface">Guardian Kinetic</span>
          </div>
          <header className="mb-10">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-2">Welcome Back</h2>
            <p className="text-secondary font-label text-sm tracking-wide">Enter your credentials to access your secure profile.</p>
          </header>

          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="group">
              <label 
                className="block font-label text-xs font-semibold text-secondary uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors" 
                htmlFor="email"
              >
                Guardian Email
              </label>
              <div className="relative">
                <input 
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-surface-container-highest px-0 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 focus:border-primary transition-all font-medium outline-none" 
                  id="email" 
                  name="email" 
                  placeholder="name@agency.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-xl">
                  alternate_email
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <label 
                  className="block font-label text-xs font-semibold text-secondary uppercase tracking-widest group-focus-within:text-primary transition-colors" 
                  htmlFor="password"
                >
                  Access Key
                </label>
                <Link className="text-xs font-label font-semibold text-primary hover:text-primary-container transition-colors" href="#">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-surface-container-highest px-0 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 focus:border-primary transition-all font-medium outline-none" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-xl">
                  lock
                </span>
              </div>
            </div>

            {/* Remember Me & Submit */}
            <div className="flex flex-col space-y-8">
              <label className="inline-flex items-center group cursor-pointer">
                <input 
                  className="form-checkbox w-5 h-5 rounded-lg border-2 border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 transition-all" 
                  type="checkbox" 
                />
                <span className="ml-3 font-label text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember this device</span>
              </label>
              <button 
                className="primary-gradient text-on-primary font-headline font-bold py-5 px-8 rounded-full shadow-[0_20px_40px_rgba(0,110,26,0.15)] hover:shadow-[0_25px_50px_rgba(0,110,26,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center w-full tracking-tight disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Authorize & Secure Access"}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-12 border-t border-outline-variant/10 text-center">
            <p className="text-secondary font-label text-sm">
              New to the network? 
              <Link className="text-on-surface font-bold hover:text-primary transition-colors ml-1" href="/signup">Create an Account</Link>
            </p>
          </footer>
        </div>

        {/* Decorative Subtle Element */}
        <div className="mt-16 flex items-center justify-center space-x-2 opacity-20 hover:opacity-50 transition-opacity">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          <span className="font-label text-[10px] uppercase tracking-[0.3em]">End-to-End Encrypted Node</span>
        </div>
      </main>

      {/* Mobile Footer */}
      <footer className="md:hidden w-full py-8 px-6 bg-surface-container-low border-t border-outline-variant/20 mt-auto">
        <div className="flex flex-col items-center space-y-4">
          <span className="font-headline font-bold text-on-surface text-sm">Guardian Kinetic</span>
          <div className="flex space-x-6">
            <Link className="text-[10px] uppercase tracking-widest text-secondary font-semibold hover:text-primary transition-colors" href="#">Safety Standards</Link>
            <Link className="text-[10px] uppercase tracking-widest text-secondary font-semibold hover:text-primary transition-colors" href="#">Privacy</Link>
          </div>
          <p className="text-[10px] text-on-secondary-container opacity-60">© 2024 Guardian Kinetic. Precision Tracking.</p>
        </div>
      </footer>
    </div>
  );
}
