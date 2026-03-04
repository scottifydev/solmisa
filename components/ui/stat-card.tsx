import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value?: string | number;
  sub?: string;
  color?: string;
  children?: ReactNode;
}

export function StatCard({ label, value, sub, color, children }: StatCardProps) {
  return (
    <div className="rounded-lg border border-steel bg-obsidian px-5 py-[18px] flex-1 min-w-[140px]">
      <div className="text-[10px] tracking-[1.5px] uppercase text-ash font-mono mb-2.5">
        {label}
      </div>
      {children || (
        <>
          <div
            className="text-[28px] font-body font-extrabold leading-none"
            style={color ? { color } : undefined}
          >
            {value}
          </div>
          {sub && (
            <div className="text-[11px] text-ash font-mono mt-1.5">{sub}</div>
          )}
        </>
      )}
    </div>
  );
}
