"use client";

import { useState } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";
import { IDontKnowButton } from "./i-dont-know-button";

const KEYS = ["C", "D", "E", "F", "G", "A", "B"] as const;

interface PianoKeyboardInputProps {
  clef: "treble" | "bass";
  note: string; // e.g. "F#4"
  showAccidental?: boolean;
  correctAnswer: string; // note letter, e.g. "F"
  onAnswer: (correct: boolean) => void;
}

function parseNote(note: string): {
  key: string;
  accidental?: string;
} {
  const match = note.match(/^([A-Ga-g])([#b]?)(\d+)$/);
  if (!match) return { key: "c/4" };
  const letter = match[1]!.toLowerCase();
  const acc = match[2] || undefined;
  const octave = match[3]!;
  return { key: `${letter}/${octave}`, accidental: acc || undefined };
}

export function PianoKeyboardInput({
  clef,
  note,
  showAccidental = true,
  correctAnswer,
  onAnswer,
}: PianoKeyboardInputProps) {
  const [tapped, setTapped] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsed = parseNote(note);
  const notationData: NotationData = {
    clef,
    key: "C",
    measures: [
      {
        notes: [
          {
            keys: [parsed.key],
            duration: "w",
            accidental: showAccidental ? parsed.accidental : undefined,
          },
        ],
      },
    ],
  };

  const correctLetter = correctAnswer.charAt(0).toUpperCase();

  const handleTap = (key: string) => {
    if (submitted) return;
    setTapped(key);
    setSubmitted(true);
    const correct = key === correctLetter;
    setTimeout(() => onAnswer(correct), correct ? 800 : 1500);
  };

  const handleDontKnow = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-[300px]">
        <NotationView data={notationData} />
      </div>

      <div className="flex w-full max-w-[420px] gap-[3px]">
        {KEYS.map((key) => {
          const isTapped = tapped === key;
          const isCorrect = submitted && key === correctLetter;
          const isWrong = submitted && isTapped && !isCorrect;

          let bg = "#1a1a2e";
          let borderColor = "#2e2e3e";
          let textColor = "#e8e0ff";
          let shadow = "none";

          if (isCorrect) {
            bg = brand.correct;
            borderColor = brand.correct;
            textColor = "#08080c";
            shadow = `0 0 8px ${brand.correct}60`;
          } else if (isWrong) {
            bg = brand.incorrect;
            borderColor = brand.incorrect;
            textColor = "#08080c";
            shadow = `0 0 8px ${brand.incorrect}60`;
          } else if (!submitted) {
            shadow = "none";
          }

          return (
            <button
              key={key}
              onClick={() => handleTap(key)}
              disabled={submitted}
              className="flex-1 flex items-end justify-center rounded-b-lg font-semibold transition-all active:scale-[0.96]"
              style={{
                backgroundColor: bg,
                border: `1.5px solid ${borderColor}`,
                color: textColor,
                height: 80,
                paddingBottom: 10,
                fontSize: 15,
                cursor: submitted ? "default" : "pointer",
                boxShadow: shadow,
                ...(!submitted && !isTapped ? { filter: "none" } : {}),
              }}
              onPointerDown={(e) => {
                if (submitted) return;
                const el = e.currentTarget;
                el.style.boxShadow = "0 0 4px rgba(139,92,246,0.3)";
              }}
              onPointerUp={(e) => {
                if (submitted) return;
                const el = e.currentTarget;
                el.style.boxShadow = "none";
              }}
              onPointerLeave={(e) => {
                if (submitted) return;
                const el = e.currentTarget;
                el.style.boxShadow = "none";
              }}
            >
              {key}
            </button>
          );
        })}
      </div>

      {submitted && tapped && tapped !== correctLetter && (
        <p className="text-center text-xs" style={{ color: brand.silver }}>
          The note is{" "}
          <span style={{ color: brand.correct, fontWeight: 600 }}>
            {correctLetter}
          </span>
        </p>
      )}

      <IDontKnowButton onDontKnow={handleDontKnow} visible={!submitted} />
    </div>
  );
}
