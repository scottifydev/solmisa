"use client";

import { brand } from "@/lib/tokens";

interface ChainContextBarProps {
  chainName: string;
  linkPosition: number;
  totalLinks: number;
  dueCount?: number;
}

export function ChainContextBar({
  chainName,
  linkPosition,
  totalLinks,
  dueCount,
}: ChainContextBarProps) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-2.5"
      style={{
        backgroundColor: brand.slate,
        border: `1px solid ${brand.steel}`,
      }}
    >
      <div className="flex items-center gap-2">
        {linkPosition > 1 && (
          <span
            className="text-sm font-semibold"
            style={{ color: brand.ivory }}
          >
            {chainName}
          </span>
        )}
        <span className="text-xs" style={{ color: brand.ash }}>
          Link {linkPosition} of {totalLinks}
        </span>
      </div>
      {dueCount !== undefined && dueCount > 0 && (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: brand.violet + "20", color: brand.violet }}
        >
          {dueCount} due
        </span>
      )}
    </div>
  );
}
