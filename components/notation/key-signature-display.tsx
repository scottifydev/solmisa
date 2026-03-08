"use client";

import { useRef, useEffect } from "react";
import { renderKeySignature } from "@/lib/notation/vexflow-renderer";

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
      result.svg.style.width = "100%";
      result.svg.style.height = "auto";
      result.svg.style.maxWidth = "200px";
    }
  }, [keySignature, clef]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        borderRadius: 12,
        padding: 16,
        background: "rgba(183, 148, 246, 0.03)",
        boxShadow:
          "0 0 20px rgba(183, 148, 246, 0.08), inset 0 0 30px rgba(183, 148, 246, 0.04)",
      }}
    />
  );
}
