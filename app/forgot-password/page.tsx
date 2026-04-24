"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-outline-variant/10 relative z-10">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">key_off</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-2">Forgot Access Key?</h1>
          <p className="text-secondary text-sm">Enter your guardian email to receive reset instructions.</p>
        </header>

        {message && (
          <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <span className="material-symbols-outlined">check_circle</span>
            {message}
          </div>
        )}

        {error && (
          <div className="bg-error/10 text-error p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 group-focus-within:text-primary transition-colors">
                Guardian Email
              </label>
              <input
                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-surface-container-highest px-0 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 focus:border-primary transition-all font-medium outline-none text-lg"
                placeholder="name@agency.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="primary-gradient w-full py-5 rounded-full text-on-primary font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Transmitting..." : "Reset Password"}
            </button>
          </form>
        )}

        <footer className="mt-10 text-center">
          <Link href="/login" className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Authentication
          </Link>
        </footer>
      </div>

      {/* Decorative Background */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
}
