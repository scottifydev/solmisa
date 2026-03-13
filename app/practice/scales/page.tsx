import type { Metadata } from "next";

export const metadata: Metadata = { title: "Scales & Modes · Practice" };

export default function ScalesPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold text-ivory">
          Scales &amp; Modes
        </h2>
        <p className="text-sm text-silver mt-1 font-body">
          Drills coming soon — SCO-405
        </p>
      </div>
    </div>
  );
}
