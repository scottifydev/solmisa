"use client";

import { useRef, useEffect } from "react";
import { renderKeySignature } from "@/lib/notation/vexflow-renderer";
import { brand } from "@/lib/tokens";

interface KeySignatureDisplayProps {
  keySignature: string;
  clef?: "treble" | "bass";
  className?: string;
}

export function KeySignatureDisplay({
  keySignature,
  clef = "treble",
  className,
}: KeySignatureDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const result = renderKeySignature(container, keySignature, clef);

    if (result.svg) {
      result.svg.setAttribute(
        "viewBox",
        `0 0 ${result.totalWidth} ${result.totalHeight}`,
      );
      // Size SVG to content width, not full container
      const maxWidth = Math.min(result.totalWidth, 300);
      result.svg.style.width = `${maxWidth}px`;
      result.svg.style.maxWidth = "100%";
      result.svg.style.height = "auto";
      result.svg.style.filter = "drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))";
    }
  }, [keySignature, clef]);

  // C major (no accidentals) — show text label instead of empty staff
  const isCMajor =
    keySignature === "C" || keySignature === "Cmaj" || keySignature === "Am";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        ref={containerRef}
        style={{ display: "flex", justifyContent: "center" }}
      />
      {isCMajor && (
        <span
          className="text-xs"
          style={{ color: brand.ash, fontStyle: "italic" }}
        >
          No sharps or flats
        </span>
      )}
    </div>
  );
}
