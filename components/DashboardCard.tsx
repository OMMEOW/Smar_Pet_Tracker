"use client";

import { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-gray-900/50 p-6 border border-slate-100 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

