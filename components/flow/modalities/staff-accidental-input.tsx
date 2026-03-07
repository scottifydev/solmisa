"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { brand } from "@/lib/tokens";
import {
  TREBLE_SHARP_POSITIONS,
  TREBLE_FLAT_POSITIONS,
} from "@/lib/notation/accidental-data";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
} from "vexflow";

const IVORY = "#F5F0EB";

// All valid treble clef positions from bottom to top
const TREBLE_POSITIONS = [
  "c/4",
  "d/4",
  "e/4",
  "f/4",
  "g/4",
  "a/4",
  "b/4",
  "c/5",
  "d/5",
  "e/5",
  "f/5",
  "g/5",
];

interface StaffAccidentalInputProps {
  clef: "treble" | "bass";
  accidentalType: "sharp" | "flat";
  expectedPositions: string[];
  onAnswer: (correct: boolean) => void;
}

export function StaffAccidentalInput({
  clef,
  accidentalType,
  expectedPositions,
  onAnswer,
}: StaffAccidentalInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[] | null>(null);

  const allPositions =
    clef === "treble"
      ? accidentalType === "sharp"
        ? TREBLE_SHARP_POSITIONS
        : TREBLE_FLAT_POSITIONS
      : TREBLE_SHARP_POSITIONS; // bass clef positions would go here

  const renderStaff = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const width = 350;
    const height = 150;
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, height);

    const context = renderer.getContext();
    context.setFillStyle(IVORY);
    context.setStrokeStyle(IVORY);

    const stave = new Stave(10, 30, 320);
    stave.addClef(clef);
    stave.setStyle({ fillStyle: IVORY, strokeStyle: IVORY });
    stave.setContext(context);
    stave.draw();

    // Render placed accidentals as notes
    if (placed.length > 0) {
      const vexNotes = placed.map((pos, i) => {
        const accSymbol = accidentalType === "sharp" ? "#" : "b";
        const note = new StaveNote({
          keys: [pos],
          duration: "q",
          clef,
        });
        note.addModifier(new Accidental(accSymbol), 0);

        const resultColor =
          results && results[i] !== undefined
            ? results[i]
              ? brand.correct
              : brand.incorrect
            : brand.violet;

        note.setStyle({ fillStyle: resultColor, strokeStyle: resultColor });
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

  const handlePositionTap = (pos: string) => {
    if (submitted) return;
    setPlaced((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos],
    );
  };

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
      {/* Staff rendering */}
      <div ref={containerRef} />

      {/* Position buttons */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {TREBLE_POSITIONS.map((pos) => {
          const isPlaced = placed.includes(pos);
          const isExpected = allPositions.includes(pos);
          return (
            <button
              key={pos}
              onClick={() => handlePositionTap(pos)}
              disabled={submitted}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: isPlaced
                  ? brand.violet + "30"
                  : brand.graphite,
                border: `1.5px solid ${isPlaced ? brand.violet : brand.steel}`,
                color: isPlaced ? brand.violet : brand.silver,
                cursor: submitted ? "default" : "pointer",
                opacity: submitted && !isExpected && !isPlaced ? 0.3 : 1,
              }}
            >
              {pos.replace("/", "")}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleCheck}
          disabled={placed.length === 0}
          className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-40"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Check Placement
        </button>
      )}
    </div>
  );
}
