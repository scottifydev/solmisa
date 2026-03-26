"use client";

import type {
  StandardNotation,
  AnalyzedChord,
  QuantizedMeasure,
} from "@/types/standards-lab";

// ─── SCO-468 Chord Chart Colors ──────────────────────────────

const CHORD_COLOR = "#f0c97a";
const BARLINE_COLOR = "#444";
const BAR_NUMBER_COLOR = "#888";
const SECTION_COLOR = "#AFA9EC";
const ACTIVE_BG = "#f0c97a0c";

const BARS_PER_ROW = 4;

// ─── Quality symbol mapping (Real Book style) ────────────────

function formatChordSymbol(symbol: string): { root: string; quality: string } {
  const match = symbol.match(/^([A-G][b#]?)(.*)/);
  if (!match) return { root: symbol, quality: "" };

  let quality = match[2] ?? "";
  // Real Book conventions
  quality = quality
    .replace("maj7", "\u0394" + "7") // Δ7
    .replace("maj9", "\u0394" + "9")
    .replace("m7b5", "\u00F8" + "7") // ø7
    .replace("dim7", "\u00B0" + "7") // °7
    .replace("dim", "\u00B0")
    .replace("min7", "m7")
    .replace("min9", "m9")
    .replace("min11", "m11")
    .replace("min6", "m6")
    .replace("min", "m")
    .replace("dom7", "7")
    .replace("dom9", "9")
    .replace("dom13", "13")
    .replace("7sus4", "7sus")
    .replace("7sus2", "7sus2")
    .replace("aug", "+");

  return { root: match[1]!, quality };
}

// ─── Component ───────────────────────────────────────────────

interface ChordChartProps {
  notation: StandardNotation;
  chords: AnalyzedChord[];
  currentBar?: number;
}

export function ChordChart({ notation, chords, currentBar }: ChordChartProps) {
  const { measures } = notation;
  if (measures.length === 0) return null;

  // Group measures into rows of BARS_PER_ROW
  const rows: QuantizedMeasure[][] = [];
  for (let i = 0; i < measures.length; i += BARS_PER_ROW) {
    rows.push(measures.slice(i, i + BARS_PER_ROW));
  }

  // Build a lookup: bar number → chord symbols in that bar
  const barChords = new Map<number, AnalyzedChord[]>();
  for (const chord of chords) {
    const existing = barChords.get(chord.bar) ?? [];
    existing.push(chord);
    barChords.set(chord.bar, existing);
  }

  return (
    <div
      style={{
        background: "#0f0f16",
        border: "1px solid #2e2e3e",
        borderRadius: 12,
        padding: "20px 24px",
        fontFamily: "'Newsreader', 'Georgia', serif",
      }}
    >
      {rows.map((row, rowIdx) => {
        const isLastRow = rowIdx === rows.length - 1;
        return (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              borderBottom: isLastRow ? "none" : undefined,
              marginBottom: isLastRow ? 0 : 4,
            }}
          >
            {row.map((measure, colIdx) => {
              const barNum = measure.barNumber;
              const isActive = barNum === currentBar;
              const isFirstInRow = colIdx === 0;
              const isLastInRow = colIdx === row.length - 1;
              const chordsInBar = barChords.get(barNum) ?? [];
              const chordSymbol = measure.chordSymbol;

              // Section detection
              const isNewSection = measure.rehearsalMark != null;
              const nextMeasure = row[colIdx + 1];
              const nextIsNewSection = nextMeasure?.rehearsalMark != null;

              return (
                <div
                  key={barNum}
                  style={{
                    flex: 1,
                    position: "relative",
                    padding: "8px 12px",
                    minHeight: 52,
                    background: isActive ? ACTIVE_BG : "transparent",
                    // Barlines
                    borderLeft: isFirstInRow
                      ? isNewSection
                        ? `3px solid ${BARLINE_COLOR}`
                        : `1px solid ${BARLINE_COLOR}`
                      : `1px solid ${BARLINE_COLOR}`,
                    borderRight: isLastInRow
                      ? isLastRow
                        ? `4px double ${BARLINE_COLOR}`
                        : `1px solid ${BARLINE_COLOR}`
                      : nextIsNewSection
                        ? `2px solid ${BARLINE_COLOR}`
                        : "none",
                  }}
                >
                  {/* Section marker */}
                  {measure.rehearsalMark && (
                    <div
                      style={{
                        position: "absolute",
                        top: -14,
                        left: 4,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        color: SECTION_COLOR,
                        background: "rgba(175,169,236,0.1)",
                        padding: "1px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {measure.rehearsalMark}
                    </div>
                  )}

                  {/* Bar number */}
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      right: 4,
                      fontSize: "0.5rem",
                      fontWeight: 500,
                      fontFamily: "'DM Sans', sans-serif",
                      color: BAR_NUMBER_COLOR,
                    }}
                  >
                    {barNum + 1}
                  </div>

                  {/* Chord symbols */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "baseline",
                      flexWrap: "wrap",
                    }}
                  >
                    {chordsInBar.length > 0 ? (
                      chordsInBar.map((chord, ci) => {
                        const { root, quality } = formatChordSymbol(
                          chord.symbol,
                        );
                        return (
                          <span key={ci} style={{ whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                color: CHORD_COLOR,
                                fontSize: "1.1rem",
                                fontWeight: 400,
                              }}
                            >
                              {root}
                            </span>
                            <span
                              style={{
                                color: CHORD_COLOR,
                                fontSize: "0.75rem",
                                verticalAlign: "super",
                                fontWeight: 400,
                              }}
                            >
                              {quality}
                            </span>
                          </span>
                        );
                      })
                    ) : chordSymbol ? (
                      (() => {
                        const { root, quality } =
                          formatChordSymbol(chordSymbol);
                        return (
                          <span style={{ whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                color: CHORD_COLOR,
                                fontSize: "1.1rem",
                                fontWeight: 400,
                              }}
                            >
                              {root}
                            </span>
                            <span
                              style={{
                                color: CHORD_COLOR,
                                fontSize: "0.75rem",
                                verticalAlign: "super",
                                fontWeight: 400,
                              }}
                            >
                              {quality}
                            </span>
                          </span>
                        );
                      })()
                    ) : (
                      <span style={{ color: "#333", fontSize: "1rem" }}>%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
