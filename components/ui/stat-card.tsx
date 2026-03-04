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
    <div className="rounded-xl border border-steel bg-obsidian p-4 sm:p-5 flex-1 min-w-[140px]">
      <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-2.5">
        {label}
      </div>
      {children || (
        <>
          <div
            className="text-[28px] font-display font-extrabold leading-none"
            style={color ? { color } : undefined}
          >
            {value}
          </div>
          {sub && (
            <div className="text-[11px] text-silver/60 font-mono mt-1.5">{sub}</div>
          )}
        </>
      )}
    </div>
  );
}
