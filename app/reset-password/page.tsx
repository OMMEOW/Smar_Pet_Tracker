"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Your access key has been updated successfully.");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError("Internal transmitter error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
        <Link href="/login" className="text-primary font-bold">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-surface-container-lowest rounded-[2.5rem] p-10 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-outline-variant/10 relative z-10">
      <header className="mb-10 text-center">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight mb-2">Initialize New Key</h1>
        <p className="text-secondary text-sm">Secure your account with a newly generated access key.</p>
      </header>

      {message && (
        <div className="bg-primary/10 text-primary p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          {message} Redirecting to login...
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
              New Access Key
            </label>
            <div className="relative">
              <input
                className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-surface-container-highest px-0 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 focus:border-primary transition-all font-medium outline-none text-lg"
                placeholder="••••••••"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
              >
                <span className="material-symbols-outlined">{showPassword ? "visibility" : "visibility_off"}</span>
              </button>
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 group-focus-within:text-primary transition-colors">
              Confirm New Key
            </label>
            <input
              className="w-full bg-transparent border-t-0 border-x-0 border-b-2 border-surface-container-highest px-0 py-3 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 focus:border-primary transition-all font-medium outline-none text-lg"
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="primary-gradient w-full py-5 rounded-full text-on-primary font-headline font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Re-encrypting..." : "Update Access Key"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <Suspense fallback={<div>Loading transmitter...</div>}>
        <ResetPasswordForm />
      </Suspense>

      {/* Decorative Background */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
    </div>
  );
}
