import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ children, className = '' }: DashboardCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}
