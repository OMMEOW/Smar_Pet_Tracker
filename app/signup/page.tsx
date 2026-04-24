"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!terms) {
      setError("Please agree to the Safety Standards and Privacy Policy");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/login?success=Account created successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Transactional Layout: Navigation Suppressed for Focus */}
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow">
        {/* Brand/Visual Side */}
        <section className="hidden md:block relative bg-surface-container-high overflow-hidden">
          <img
            alt="Guardian Kinetic Protection"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-vDCmjtwFAfyhX23pjcfeypPNiv3VeP0mH-iGPX7WJt5tbmUSaBs5EgFXWvMZxfrklK7stpSCisR8KAyU1DDSWTIJuHJDSQ7ygc4NMWmzJHpL053s7i_key0vpFltyOK6MvF4gVWtrKz1YNVljPMW3k4fbJTjsuZBm-E4Ep5ZH4hglsujhqjDi8ju1_aH-GsK27895i8jtFvuZ5a5Obm5z921lLuAryiJkEBhyCnl467TGQ5zDnsh04HdE2mn6eeweDmfyewFCM8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-surface-container-lowest">
            <p className="font-headline font-bold text-3xl tracking-tight leading-tight">
              Guardian Kinetic
            </p>
            <p className="font-body text-surface-variant mt-2 opacity-90 max-w-xs">
              Advanced biometric tracking and precision safe-zones for your most loyal companion.
            </p>
          </div>
        </section>

        {/* Form Side */}
        <section className="p-8 md:p-16 flex flex-col justify-center bg-surface-container-lowest">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-8 md:hidden">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span className="font-headline font-extrabold text-xl tracking-tighter text-on-surface">Guardian Kinetic</span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tighter mb-2">Create Account</h1>
            <p className="font-label text-secondary tracking-wide uppercase text-[10px] font-semibold opacity-70">Securing your journey together</p>
          </header>

          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-6 text-sm font-medium border border-error/20">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div className="relative group">
              <label className="block font-label text-xs font-semibold text-secondary mb-1" htmlFor="name">FULL NAME</label>
              <input
                className="input-minimal w-full font-body text-on-surface placeholder:text-outline-variant/50 focus:placeholder:text-transparent"
                id="name"
                name="name"
                placeholder="Enter your name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* Email Field */}
            <div className="relative group">
              <label className="block font-label text-xs font-semibold text-secondary mb-1" htmlFor="email">EMAIL ADDRESS</label>
              <input
                className="input-minimal w-full font-body text-on-surface placeholder:text-outline-variant/50 focus:placeholder:text-transparent"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Password Field */}
            <div className="relative group">
              <label className="block font-label text-xs font-semibold text-secondary mb-1" htmlFor="password">PASSWORD</label>
              <div className="relative">
                <input
                  className="input-minimal w-full font-body text-on-surface placeholder:text-outline-variant/50 focus:placeholder:text-transparent pr-10"
                  id="password"
                  name="password"
                  placeholder="Create a secure password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-outline-variant hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <div className="pt-0.5">
                <input
                  className="rounded-sm border-outline-variant text-primary focus:ring-primary-container h-4 w-4"
                  id="terms"
                  name="terms"
                  required
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
              </div>
              <label className="text-xs text-secondary leading-relaxed" htmlFor="terms">
                I agree to the <Link className="text-primary font-semibold hover:underline" href="#">Safety Standards</Link> and <Link className="text-primary font-semibold hover:underline" href="#">Privacy Policy</Link>.
              </label>
            </div>
            {/* Action Button */}
            <button
              className="primary-gradient w-full py-4 rounded-full text-on-primary font-headline font-bold tracking-tight text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Get Started"}
            </button>
          </form>

          {/* Footer / Redirect */}
          <footer className="mt-10 pt-8 border-t border-surface-container-high">
            <p className="text-sm text-center font-body text-secondary">
              Already a guardian?
              <Link className="text-primary font-bold hover:underline transition-all ml-1" href="/login">Log In</Link>
            </p>
          </footer>
        </section>
      </main>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-primary-container/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-0 w-1/4 h-1/4 bg-primary-fixed/5 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
}
