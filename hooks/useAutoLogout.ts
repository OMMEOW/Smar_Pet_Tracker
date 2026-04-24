"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

export const useAutoLogout = (timeoutMs: number = 15 * 60 * 1000) => {
  const { data: session, status } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (status === "authenticated") {
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: "/?logout=true" });
      }, timeoutMs);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    
    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [status, timeoutMs]);
};
