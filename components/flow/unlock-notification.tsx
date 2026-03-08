"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/tokens";
import type { UnlockResult } from "@/lib/chains/types";

interface UnlockNotificationProps {
  unlock: UnlockResult;
  onDismiss: () => void;
}

export function UnlockNotification({
  unlock,
  onDismiss,
}: UnlockNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 3s
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl px-6 py-5 transition-all duration-300"
      style={{
        backgroundColor: brand.violet + "12",
        border: `1.5px solid ${brand.violet}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
      }}
    >
      {/* Lock → unlock icon */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: brand.violet + "25",
          border: `2px solid ${brand.violet}`,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={brand.violet}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: brand.violet }}>
          Link {unlock.newPosition} Unlocked
        </p>
        <p className="text-sm" style={{ color: brand.ivory }}>
          {unlock.chainName}
        </p>
        <p className="text-xs" style={{ color: brand.ash }}>
          {unlock.linkDescription}
        </p>
      </div>
    </div>
  );
}
