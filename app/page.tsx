"use client";

import { useSession } from "next-auth/react";
import DashboardView from "@/components/DashboardView";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-screen w-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session) {
    return <DashboardView />;
  }

  return <LandingPage />;
}
