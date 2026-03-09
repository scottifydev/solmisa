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
      result.svg.style.filter = "drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))";
    }
  }, [keySignature, clef]);

  return <div ref={containerRef} className={className} style={{}} />;
}
