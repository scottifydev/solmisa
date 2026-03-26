"use client";

import type { AnalyzedChord } from "@/types/standards-lab";
import { MiniKeyboard } from "./MiniKeyboard";

interface AnalysisPanelProps {
  chord: AnalyzedChord | null;
  onKeyClick?: (midi: number) => void;
}

const LEGEND_ITEMS: { label: string; color: string }[] = [
  { label: "Root", color: "#f87171" },
  { label: "Chord tone", color: "#60a5fa" },
  { label: "Tension", color: "#2dd4bf" },
  { label: "Avoid", color: "#ef4444" },
];

export function AnalysisPanel({ chord, onKeyClick }: AnalysisPanelProps) {
  if (!chord) {
    return (
      <div
        style={{
          background: "#0f0f16",
          border: "1px solid #2e2e3e",
          borderRadius: 12,
          padding: 16,
          fontFamily: "'DM Sans', sans-serif",
          color: "#8882a0",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        Select a chord to see analysis
      </div>
    );
  }

  const rootPc = chord.rootMidi % 12;

  return (
    <div
      style={{
        background: "#0f0f16",
        border: "1px solid #2e2e3e",
        borderRadius: 12,
        padding: 16,
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Chord symbol */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 24,
          fontWeight: "bold",
          color: "#f0c97a",
        }}
      >
        {chord.symbol}
      </div>

      {/* Roman numeral + function */}
      <div style={{ fontSize: 14, color: "#a09bb3" }}>
        {chord.function.romanNumeral}
        {chord.function.isSecondary && chord.function.secondaryTarget
          ? ` / ${chord.function.secondaryTarget}`
          : ""}{" "}
        <span style={{ opacity: 0.7 }}>({chord.function.functionType})</span>
      </div>

      {/* Key center */}
      <div style={{ fontSize: 12, color: "#8882a0" }}>
        Key center: {chord.function.keyCenter}
      </div>

      {/* Compatible scales */}
      {chord.compatibleScales.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {chord.compatibleScales.map((scale) => (
            <span
              key={scale}
              style={{
                fontSize: 11,
                color: "#eae8e4",
                background: "#1e1e2e",
                border: "1px solid #2e2e3e",
                borderRadius: 6,
                padding: "2px 8px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {scale}
            </span>
          ))}
        </div>
      )}

      {/* Mini keyboard */}
      <MiniKeyboard
        chordTones={chord.chordTones}
        rootPc={rootPc}
        tensions={chord.tensions}
        avoidNotes={chord.avoidNotes}
        onKeyClick={onKeyClick}
      />

      {/* Color legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {LEGEND_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              color: "#a09bb3",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
