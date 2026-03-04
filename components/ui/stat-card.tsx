import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  children?: ReactNode;
}

export function StatCard({ label, value, sub, color, children }: StatCardProps) {
  return (
    <div className="rounded-xl border border-steel bg-charcoal p-4">
      <div className="text-silver text-sm font-body">{label}</div>
      <div
        className="text-2xl font-display font-bold mt-1"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {sub && <div className="text-silver text-xs mt-0.5">{sub}</div>}
      {children}
    </div>
  );
}
