"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);

  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      setShowLogoutMsg(true);
      const timer = setTimeout(() => {
        setShowLogoutMsg(false);
        // Clean up the URL
        const newPath = window.location.pathname;
        router.replace(newPath);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen relative">
      {showLogoutMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-primary text-on-primary px-8 py-3 rounded-full shadow-2xl font-headline font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            Logout successful. Your session has been secured.
          </div>
        </div>
      )}
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 dark:bg-[#2e3034]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-headline tracking-tight">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
          <div className="text-xl font-bold tracking-tighter text-[#1a1c1f] dark:text-[#f9f9fe]">Guardian Kinetic</div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-[#1a1c1f]/70 dark:text-[#f9f9fe]/70 font-medium hover:text-[#006e1a] dark:hover:text-[#71ff74] transition-colors duration-300" href="#features">Features</Link>
            <Link className="text-[#1a1c1f]/70 dark:text-[#f9f9fe]/70 font-medium hover:text-[#006e1a] dark:hover:text-[#71ff74] transition-colors duration-300" href="#">Live Tracking</Link>
            <Link className="text-[#1a1c1f]/70 dark:text-[#f9f9fe]/70 font-medium hover:text-[#006e1a] dark:hover:text-[#71ff74] transition-colors duration-300" href="#">Safe Zones</Link>
            <Link className="text-[#1a1c1f]/70 dark:text-[#f9f9fe]/70 font-medium hover:text-[#006e1a] dark:hover:text-[#71ff74] transition-colors duration-300" href="#">Support</Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/" className="bg-[#006e1a] text-white px-6 py-2.5 rounded-full font-bold text-sm scale-95 hover:scale-100 duration-200 ease-in-out">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden md:block text-[#1a1c1f]/70 font-medium hover:text-[#006e1a] transition-colors">Log In</Link>
                <Link href="/signup" className="bg-[#006e1a] text-white px-6 py-2.5 rounded-full font-bold text-sm scale-95 hover:scale-100 duration-200 ease-in-out">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-surface">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-block bg-primary-container/10 text-primary px-4 py-1.5 rounded-full font-bold tracking-widest text-[10px] uppercase mb-6">Unrivaled Precision</span>
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-on-background mb-8 leading-[0.95] font-headline">
                The watchtower for your <span className="text-primary italic">wildest</span> friend.
              </h1>
              <p className="text-xl text-secondary mb-10 max-w-lg leading-relaxed font-body">
                Guardian Kinetic delivers Swiss-grade tracking accuracy and real-time health diagnostics, ensuring your guardian is never out of reach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="primary-gradient text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95 text-center">Protect Your Dog Now</Link>
                <button className="bg-surface-container-low border border-outline-variant/20 text-on-surface px-8 py-4 rounded-full font-bold text-lg hover:bg-surface-container-high transition-colors">Explore Features</button>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-slate-200 overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9xgKhlzOGtulSXeO2SVUWqI3k7ppzWe3YV7xQvQ2li8praYx2GIGiwQTrH_MgbZ9HIa8b_tI5h2AVeHdSUKkNv9Yp0v697I5Zj1-6U_mq86_46C4ZWkgVR_UeXF6FOk_dE25iJ935wqwWGL5MWYRNoyGLjN7zmNq161RpZVpAzfdC8LGvXoFdpftSuOyIB7zzx0YCez7IpMrUXODgxka9hg31N0uj3tOyctXTZ5p88Ev9D1y2piuhXZoirige-Q6qyGu3Y78b-A0" alt="Pet" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-slate-300 overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWPH6KGl-IAEtCmlIVF3UEciKcKgPJ6IR41aMIVyW9KD0RveL4e65t3_tOoE6mRjn5ZSRmm2EKRFJzvmdfutA9Zr0dQPgA9w0Wt-xG15WC9la8b4J3Fv2hTBOQMmAoEuXPQdO2e7HmPyhOKzZh6kcwyqanBPg0ZR6LKjxF-D8t40UaeasJqz6E4q1SPj7AwoKaFATOdy1Bvhpwk1lpd-5-t1G3LiV-iCbtEP8F_peQfCMb7c9PYF-OxfwrDPJ1n_D5Jy9ofUwTeS4" alt="Pet" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-surface bg-slate-400 overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFJXlvg2gOkBlMLzuAp-Ps9Ns3ksV8usItKOzwYnfbVc-0kM8cp0Dsx3USW1NtbRV6BVAf0COiTl35BQ0gElF4EARjgDDVAJC7knBDpVqlWhn1Mw2uMq8VgllJ68ZoJ770IlERTs60MC7U2d3meowglIhm7XQtSPpwEIZWxYKVaJ6ZtSxcuSDbW6DygKXMPBWy9bzkMVRkq6Xo6Yis_r1MXMOB7LnR5KFL-6dGjn2pnEwoSVJU9g9EXtftwRaBsgIK3l6gWZgQVBU" alt="Pet" />
                  </div>
                </div>
                <p className="text-sm text-secondary font-medium font-body"><span className="text-on-background font-bold">4,000+</span> Modern Guardians protected.</p>
              </div>
            </div>
            <div className="relative lg:h-[600px]">
              <div className="absolute inset-0 bg-primary-container/5 rounded-[48px] rotate-3 translate-x-4"></div>
              <div className="relative h-full rounded-[48px] overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCql8igzVfzua3xXFbSXHwlUuUPoX6blT98c9vrpOC-csn2HqQPrT1rKUknVoVV5qddi5sNm9pTFLQ-EHSWGeAL7BLCg2W0FSi-SVyzra0nuiYqWih-sMCQRuZ4RzyIV0nuJshaoWzlDUx4mu9R92iq8JE4qhR28pHt83gxMEHkTL-8Pxyu-zSanmMxejqYGVRo-JLksTWXpULUxhhNDvgZjfo5GCRe9SBmpKz2yudDR7FtCYJ_U6IQD9-ScenlCWTc6A6tLizan2w" alt="Hero dog" />
                <div className="absolute bottom-8 left-8 right-8 glass-card rounded-3xl p-6 flex items-center gap-4 border border-white/20">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Luna is Safe</h4>
                    <p className="text-sm text-secondary">Central Park · Active 2m ago</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-12 h-6 bg-primary-fixed rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-32 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 max-w-2xl">
              <h2 className="text-5xl font-extrabold tracking-tight mb-6 font-headline">Designed for peace of mind.</h2>
              <p className="text-xl text-secondary font-body">Advanced IoT technology paired with an editorial design that makes monitoring your pet an aesthetic experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
              {/* Live Map */}
              <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl">map</span>
                  <h3 className="text-2xl font-bold mb-2 font-headline">Live Map Precision</h3>
                  <p className="text-secondary max-w-sm font-body">Sub-meter accuracy using multi-constellation GNSS satellites. Never lose sight, even in dense urban forests.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-40 md:opacity-100 transition-transform group-hover:scale-105 duration-700">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA38hF0OHyzYwNru92z12P7xim9HaDN78To0H8IFYv7yKQrv6ifT3QCAlalZ2pgV0Dp0q1i5Kpq22jystCbC_8lNMcs2UXyR5YFDFqrnjyQE1KOS3hQmsS8z-Y3rbxqDcEdWlrktFreb8rmnNhUK3jqIia8FlPKnGUZx3teGMHHWxscKKJiy6pa_TMwNVomIUw9Q5h3QR7IRrglQLtfJS0Lyegq6Ol5kULzmkLcW8LM6dS5dlcW7fyvUnjvhO1Q_Cef85c8HsM8NDg" alt="Map" />
                </div>
              </div>
              {/* Health Alerts */}
              <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-[2rem] p-8 flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined mb-4 text-3xl">favorite</span>
                  <h3 className="text-2xl font-bold mb-2 font-headline">Health Diagnostics</h3>
                  <p className="opacity-80 font-body">Monitoring heart rate and sleep patterns to catch anomalies before they become emergencies.</p>
                </div>
                <div className="flex items-end justify-between font-headline">
                  <div className="text-4xl font-bold">98<span className="text-lg opacity-60">bpm</span></div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-6 bg-on-primary-container/20 rounded-full"></div>
                    <div className="w-1.5 h-8 bg-on-primary-container/40 rounded-full"></div>
                    <div className="w-1.5 h-10 bg-on-primary-container rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Geofencing */}
              <div className="md:col-span-4 bg-surface-container-high rounded-[2rem] p-8 flex flex-col justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-white mx-auto mb-6 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary text-4xl">radar</span>
                </div>
                <h3 className="text-xl font-bold mb-2 font-headline">Smart Safe Zones</h3>
                <p className="text-secondary text-sm font-body">Draw custom boundaries on your phone. Get instant alerts when they're breached.</p>
              </div>
              {/* Safe-Zone Radar UI */}
              <div className="md:col-span-8 bg-inverse-surface text-inverse-on-surface rounded-[2rem] p-8 flex items-center gap-12 overflow-hidden">
                <div className="shrink-0 relative">
                  <div className="w-48 h-48 rounded-full border border-primary/30 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-primary/60 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                        <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_#28cd41]"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">The Kinetic Shield</h3>
                  <p className="text-inverse-on-surface/60 mb-6 font-body">Our proprietary algorithm predicts movement patterns to alert you seconds *before* a boundary is crossed.</p>
                  <button className="text-primary-fixed font-bold flex items-center gap-2 font-label">Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-6 font-headline">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-xl">
                <span className="text-primary font-bold tracking-widest uppercase mb-4 block text-[10px]">The Process</span>
                <h2 className="text-5xl font-extrabold tracking-tight">Three steps to eternal vigilance.</h2>
              </div>
              <div className="hidden md:block h-px flex-1 mx-12 bg-outline-variant/20 mb-6"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="group">
                <div className="text-8xl font-black text-surface-container-high mb-8 group-hover:text-primary-container/20 transition-colors">01</div>
                <h4 className="text-2xl font-bold mb-4">Attach the Kinetic Collar</h4>
                <p className="text-secondary leading-relaxed font-body font-medium">Aerospace-grade aluminum housing that weighs less than an ounce. Rugged, waterproof, and bite-resistant.</p>
              </div>
              <div className="group">
                <div className="text-8xl font-black text-surface-container-high mb-8 group-hover:text-primary-container/20 transition-colors">02</div>
                <h4 className="text-2xl font-bold mb-4">Sync with the Guardian App</h4>
                <p className="text-secondary leading-relaxed font-body font-medium">Instant pairing via Bluetooth 5.2. Access your dog's dashboard from any device, anywhere in the world.</p>
              </div>
              <div className="group">
                <div className="text-8xl font-black text-surface-container-high mb-8 group-hover:text-primary-container/20 transition-colors">03</div>
                <h4 className="text-2xl font-bold mb-4">Set Your Safe Zones</h4>
                <p className="text-secondary leading-relaxed font-body font-medium">Define the perimeter of your home, park, or day care. Relax knowing we're always watching over them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="primary-gradient rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white blur-[120px] rounded-full"></div>
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-8 max-w-3xl mx-auto leading-tight font-headline">Ready to upgrade your dog's security?</h2>
                <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto font-body">Join the community of modern guardians who choose precision over guesswork.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link href="/signup" className="bg-white text-primary px-10 py-5 rounded-full font-bold text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95">Get Started Today</Link>
                  <button className="bg-transparent border border-white/30 text-white px-10 py-5 rounded-full font-bold text-xl backdrop-blur-sm hover:bg-white/10 transition-colors">Speak to an Expert</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f3f3f8] dark:bg-[#1a1c1f] w-full py-12 px-6">
        <div className="max-w-7xl mx-auto border-t border-[#bccbb5]/20 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="font-headline font-bold text-[#1a1c1f] dark:text-[#f9f9fe] text-2xl mb-4">Guardian Kinetic</div>
              <p className="text-secondary opacity-60 max-w-xs font-body text-sm tracking-wide">
                Precision Tracking for the Modern Guardian. Engineered for reliability, designed for the soul.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-3 font-body font-medium">
                <Link className="text-secondary opacity-60 hover:opacity-100 transition-opacity text-sm tracking-wide" href="#">Privacy Policy</Link>
                <Link className="text-secondary opacity-60 hover:opacity-100 transition-opacity text-sm tracking-wide" href="#">Terms of Service</Link>
              </div>
              <div className="flex flex-col gap-3 font-body font-medium">
                <Link className="text-secondary opacity-60 hover:opacity-100 transition-opacity text-sm tracking-wide" href="#">Safety Standards</Link>
                <Link className="text-secondary opacity-60 hover:opacity-100 transition-opacity text-sm tracking-wide" href="#">Contact Us</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-outline-variant/10 pt-8">
            <div className="text-secondary opacity-60 font-body text-sm tracking-wide">
              © 2024 Guardian Kinetic. Precision Tracking for the Modern Guardian.
            </div>
            <div className="flex gap-6">
              <span className="material-symbols-outlined text-secondary opacity-60 cursor-pointer hover:text-primary transition-colors">social_leaderboard</span>
              <span className="material-symbols-outlined text-secondary opacity-60 cursor-pointer hover:text-primary transition-colors">share</span>
              <span className="material-symbols-outlined text-secondary opacity-60 cursor-pointer hover:text-primary transition-colors">rss_feed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
