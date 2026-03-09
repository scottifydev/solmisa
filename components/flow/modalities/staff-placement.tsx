"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { brand } from "@/lib/tokens";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";

const IVORY = "#F5F0EB";

type ClefType = "treble" | "bass" | "alto" | "tenor";

// Maps line index (0..12) to note position for each clef.
// Index 0 = line -1 (one line above staff), index 2 = line 0 (top line),
// index 10 = line 4 (bottom line), index 12 = line 5 (one ledger below).
// Odd indices are spaces between lines.
const CLEF_POSITIONS: Record<ClefType, string[]> = {
  treble: [
    "a/5",
    "g/5",
    "f/5",
    "e/5",
    "d/5",
    "c/5",
    "b/4",
    "a/4",
    "g/4",
    "f/4",
    "e/4",
    "d/4",
    "c/4",
  ],
  bass: [
    "c/4",
    "b/3",
    "a/3",
    "g/3",
    "f/3",
    "e/3",
    "d/3",
    "c/3",
    "b/2",
    "a/2",
    "g/2",
    "f/2",
    "e/2",
  ],
  alto: [
    "b/4",
    "a/4",
    "g/4",
    "f/4",
    "e/4",
    "d/4",
    "c/4",
    "b/3",
    "a/3",
    "g/3",
    "f/3",
    "e/3",
    "d/3",
  ],
  tenor: [
    "g/4",
    "f/4",
    "e/4",
    "d/4",
    "c/4",
    "b/3",
    "a/3",
    "g/3",
    "f/3",
    "e/3",
    "d/3",
    "c/3",
    "b/2",
  ],
};

interface StaffPlacementProps {
  clef: ClefType;
  accidentalType: "sharp" | "flat";
  expectedPositions: string[];
  onAnswer: (correct: boolean) => void;
}

export function StaffPlacement({
  clef,
  accidentalType,
  expectedPositions,
  onAnswer,
}: StaffPlacementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const staveMetricsRef = useRef<{ yTop: number; spacing: number } | null>(
    null,
  );
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[] | null>(null);

  const renderStaff = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const width = 350;
    const height = 180;
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);

    const context = renderer.getContext();
    context.setFillStyle(IVORY);
    context.setStrokeStyle(IVORY);

    const stave = new Stave(10, 40, 320);
    stave.addClef(clef);
    stave.setStyle({ fillStyle: IVORY, strokeStyle: IVORY });
    stave.setContext(context);
    stave.draw();

    // Store metrics for click-to-position mapping
    const yLine0 = stave.getYForLine(0);
    const yLine1 = stave.getYForLine(1);
    staveMetricsRef.current = {
      yTop: yLine0,
      spacing: yLine1 - yLine0,
    };

    // Render placed accidentals as notes
    if (placed.length > 0) {
      const accSymbol = accidentalType === "sharp" ? "#" : "b";
      const vexNotes = placed.map((pos, i) => {
        const note = new StaveNote({
          keys: [pos],
          duration: "q",
          clef,
        });
        note.addModifier(new Accidental(accSymbol), 0);

        const color =
          results && results[i] !== undefined
            ? results[i]
              ? brand.correct
              : brand.incorrect
            : brand.violet;

        note.setStyle({ fillStyle: color, strokeStyle: color });
        return note;
      });

      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.setMode(Voice.Mode.SOFT);
      voice.addTickables(vexNotes);
      new Formatter().joinVoices([voice]).format([voice], 250);
      voice.draw(context, stave);
    }

    const svg = container.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.style.width = "100%";
      svg.style.height = "auto";
    }
  }, [placed, results, clef, accidentalType]);

  useEffect(() => {
    renderStaff();
  }, [renderStaff]);

  const handleStaffClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (submitted || !staveMetricsRef.current) return;

      const container = containerRef.current;
      if (!container) return;
      const svg = container.querySelector("svg");
      if (!svg) return;

      const svgRect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;
      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;

      const svgX = (e.clientX - svgRect.left) * scaleX;
      const svgY = (e.clientY - svgRect.top) * scaleY;

      // Ignore clicks on the clef area (first ~60px)
      if (svgX < 60) return;

      const { yTop, spacing } = staveMetricsRef.current;
      const lineNumber = (svgY - yTop) / spacing;

      // Snap to nearest half-line (line or space)
      const snapped = Math.round(lineNumber * 2) / 2;

      // Clamp to valid range: line -1 to line 5
      const clamped = Math.max(-1, Math.min(5, snapped));

      // Convert to array index: line -1 → index 0, line 5 → index 12
      const index = (clamped + 1) * 2;
      const positions = CLEF_POSITIONS[clef];
      if (index < 0 || index >= positions.length) return;

      const pos = positions[index];
      if (!pos) return;

      setPlaced((prev) =>
        prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
      );
    },
    [submitted, clef],
  );

  const handleCheck = () => {
    const posResults = placed.map((pos, i) => pos === expectedPositions[i]);
    const allCorrect =
      placed.length === expectedPositions.length && posResults.every(Boolean);

    setResults(posResults);
    setSubmitted(true);

    if (!allCorrect) {
      setTimeout(() => {
        setPlaced(expectedPositions);
        setResults(expectedPositions.map(() => true));
      }, 1500);
    }

    setTimeout(() => onAnswer(allCorrect), allCorrect ? 800 : 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Interactive staff — tap to place accidentals */}
      <div
        ref={containerRef}
        onClick={handleStaffClick}
        className="cursor-crosshair"
      />

      <p className="text-center text-xs" style={{ color: brand.silver }}>
        Tap the staff to place {accidentalType === "sharp" ? "sharps" : "flats"}{" "}
        in order
        {placed.length > 0 && (
          <span style={{ color: brand.violet }}> ({placed.length} placed)</span>
        )}
      </p>

      <div className="flex gap-2">
        {!submitted && placed.length > 0 && (
          <button
            onClick={() => setPlaced((prev) => prev.slice(0, -1))}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: brand.graphite,
              color: brand.silver,
              border: `1px solid ${brand.steel}`,
            }}
          >
            Undo
          </button>
        )}
        {!submitted && (
          <button
            onClick={handleCheck}
            disabled={placed.length === 0}
            className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-40"
            style={{
              backgroundColor: brand.violet,
              color: brand.night,
            }}
          >
            Check Placement
          </button>
        )}
      </div>
    </div>
  );
}
