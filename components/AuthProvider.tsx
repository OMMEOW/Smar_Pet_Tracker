"use client";

import { SessionProvider } from "next-auth/react";
import { useAutoLogout } from "@/hooks/useAutoLogout";

function SessionManager({ children }: { children: React.ReactNode }) {
  useAutoLogout();
  return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionManager>{children}</SessionManager>
    </SessionProvider>
  );
}
