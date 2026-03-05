"use client";

import { useState } from "react";
import { LogActivityModal } from "./log-activity-modal";

export function LogActivityButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Log activity"
        className="fixed bottom-6 right-6 sm:static sm:w-full sm:bottom-auto sm:right-auto rounded-full sm:rounded-xl bg-coral hover:bg-coral/90 text-night font-bold text-sm transition-colors shadow-lg sm:shadow-none p-4 sm:p-3 sm:px-4 flex items-center justify-center gap-2 z-40"
      >
        <span className="text-lg leading-none">+</span>
        <span className="hidden sm:inline">Log Activity</span>
      </button>
      <LogActivityModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
