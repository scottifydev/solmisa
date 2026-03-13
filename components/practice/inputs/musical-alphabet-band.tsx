"use client";

import { useState, useRef } from "react";

export type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type Accidental = "sharp" | "flat" | null;

const LETTERS: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
const DRAG_THRESHOLD = 18;

function getNoteName(letter: NoteName, acc: Accidental): string {
  if (acc === "sharp") return letter + "♯";
  if (acc === "flat") return letter + "♭";
  return letter;
}

interface MusicalAlphabetBandProps {
  correctAnswer: string;
  onAnswer: (correct: boolean, note: string) => void;
  disabled?: boolean;
}

type Confirmed = { note: string; correct: boolean } | null;

export function MusicalAlphabetBand({
  correctAnswer,
  onAnswer,
  disabled = false,
}: MusicalAlphabetBandProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<NoteName | null>(null);
  const [accidental, setAccidental] = useState<Accidental>(null);
  const [confirmed, setConfirmed] = useState<Confirmed>(null);
  const startY = useRef<number | null>(null);

  function letterFromX(clientX: number): NoteName | null {
    if (!bandRef.current) return null;
    const rect = bandRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const segW = rect.width / 7;
    const idx = Math.max(0, Math.min(6, Math.floor(x / segW)));
    return LETTERS[idx] ?? null;
  }

  function accFromY(clientY: number): Accidental {
    if (startY.current === null) return null;
    const dy = clientY - startY.current;
    if (dy < -DRAG_THRESHOLD) return "sharp";
    if (dy > DRAG_THRESHOLD) return "flat";
    return null;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled || confirmed) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    startY.current = e.clientY;
    setCurrentLetter(letterFromX(e.clientX));
    setAccidental(null);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || confirmed) return;
    setCurrentLetter(letterFromX(e.clientX));
    setAccidental(accFromY(e.clientY));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || confirmed) return;
    setDragging(false);
    const letter = currentLetter;
    const acc = accidental;
    startY.current = null;
    if (!letter) return;
    const note = getNoteName(letter, acc);
    const correct = note === correctAnswer;
    setConfirmed({ note, correct });
    onAnswer(correct, note);
  }

  const activeIdx = currentLetter ? LETTERS.indexOf(currentLetter) : -1;

  // Border color
  const borderColor = confirmed
    ? confirmed.correct
      ? "#4ade80"
      : "#f87171"
    : dragging
      ? "#8b5cf6"
      : "#2e2e3e";
  const boxShadow = confirmed
    ? `0 0 16px ${confirmed.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`
    : dragging
      ? "0 0 12px rgba(139,92,246,0.3)"
      : "none";

  return (
    <div style={{ width: "100%", maxWidth: 420, touchAction: "none" }}>
      {/* Hint */}
      {!confirmed && (
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
            marginBottom: 8,
            opacity: dragging ? 1 : 0.5,
          }}
        >
          {dragging
            ? "↑ sharp · — natural · ↓ flat"
            : "Slide to select · up ♯ · down ♭"}
        </div>
      )}

      {/* Band */}
      <div
        ref={bandRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          display: "flex",
          height: 56,
          borderRadius: 28,
          background: "linear-gradient(to right, #181821, #22222f, #181821)",
          border: `1.5px solid ${borderColor}`,
          boxShadow,
          overflow: "visible",
          cursor: disabled || confirmed ? "default" : "grab",
          position: "relative",
          transition: "border-color 0.15s, box-shadow 0.15s",
          userSelect: "none",
        }}
      >
        {LETTERS.map((l, i) => {
          const isActive = activeIdx === i && (dragging || !!confirmed);
          let color = "#a09bb3";
          let weight: number = 500;
          let bg = "transparent";
          let scale = 1;

          if (
            confirmed &&
            confirmed.note.charAt(0) === l &&
            currentLetter === l
          ) {
            color = confirmed.correct ? "#4ade80" : "#f87171";
            weight = 700;
            bg = confirmed.correct
              ? "rgba(74,222,128,0.1)"
              : "rgba(248,113,113,0.1)";
            scale = 1.1;
          } else if (
            confirmed &&
            !confirmed.correct &&
            correctAnswer.charAt(0) === l
          ) {
            color = "#4ade80";
            weight = 700;
            bg = "rgba(74,222,128,0.1)";
          } else if (isActive) {
            color = "#8b5cf6";
            weight = 700;
            bg = "rgba(139,92,246,0.08)";
            scale = 1.1;
          }

          return (
            <div
              key={l}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                transition: "all 0.08s ease",
                position: "relative",
                transform:
                  isActive && accidental && !confirmed
                    ? `translateY(${accidental === "sharp" ? "-6px" : "6px"})`
                    : "translateY(0)",
                borderRadius: isActive && accidental ? 8 : 0,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: weight,
                  fontFamily: "'Outfit',sans-serif",
                  color,
                  transform: `scale(${scale})`,
                  transition: "all 0.08s ease",
                  pointerEvents: "none",
                }}
              >
                {l}
              </span>

              {/* Bulge */}
              {isActive && accidental && !confirmed && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    ...(accidental === "sharp"
                      ? { bottom: "100%", marginBottom: -8 }
                      : { top: "100%", marginTop: -8 }),
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #22222f, #181821)",
                    border: "1.5px solid #8b5cf6",
                    boxShadow: "0 0 14px rgba(139,92,246,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#8b5cf6",
                      fontFamily: "serif",
                      textShadow: "0 0 8px rgba(139,92,246,0.3)",
                    }}
                  >
                    {accidental === "sharp" ? "♯" : "♭"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected note display */}
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {(dragging || confirmed) && currentLetter && (
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'Outfit',sans-serif",
              color: confirmed
                ? confirmed.correct
                  ? "#4ade80"
                  : "#f87171"
                : "#8b5cf6",
              textShadow: confirmed
                ? `0 0 16px ${confirmed.correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`
                : "0 0 12px rgba(139,92,246,0.3)",
              transition: "all 0.15s",
            }}
          >
            {getNoteName(currentLetter, accidental)}
            {confirmed && !confirmed.correct && (
              <span style={{ color: "#4ade80", marginLeft: 16, fontSize: 18 }}>
                → {correctAnswer}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
