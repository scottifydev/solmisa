"use client";

import { useState, useRef, useCallback } from "react";

export type NoteKey =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

const WHITE_KEYS: NoteKey[] = ["C", "D", "E", "F", "G", "A", "B"];

// Black key layout: left% and label
const BLACK_KEYS: { note: NoteKey; left: string; label: string }[] = [
  { note: "C#", left: "11.5%", label: "C♯" },
  { note: "D#", left: "25.0%", label: "D♯" },
  { note: "F#", left: "53.5%", label: "F♯" },
  { note: "G#", left: "67.0%", label: "G♯" },
  { note: "A#", left: "80.5%", label: "A♯" },
];

type KeyState = "default" | "correct" | "incorrect" | "hint";

interface PianoKeyboardProps {
  onKeyPress: (note: NoteKey) => void;
  keyStates?: Partial<Record<NoteKey, KeyState>>;
  disabled?: boolean;
}

const WHITE_KEY_COLORS: Record<KeyState, string> = {
  default: "linear-gradient(180deg, #f0ecff 0%, #e0daf5 100%)",
  correct: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
  incorrect: "linear-gradient(180deg, #f87171 0%, #ef4444 100%)",
  hint: "linear-gradient(180deg, #4ade80 0%, #22c55e 100%)",
};

const BLACK_KEY_COLORS: Record<KeyState, string> = {
  default: "#0c0a18",
  correct: "#22c55e",
  incorrect: "#ef4444",
  hint: "#22c55e",
};

export function PianoKeyboard({
  onKeyPress,
  keyStates = {},
  disabled = false,
}: PianoKeyboardProps) {
  const handleKeyDown = useCallback(
    (note: NoteKey, e: React.PointerEvent) => {
      e.preventDefault();
      if (disabled) return;
      onKeyPress(note);
    },
    [onKeyPress, disabled],
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 380,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* White keys */}
      <div
        style={{
          display: "flex",
          gap: 2,
          position: "relative",
        }}
      >
        {WHITE_KEYS.map((note) => {
          const state = keyStates[note] ?? "default";
          return (
            <div
              key={note}
              onPointerDown={(e) => handleKeyDown(note, e)}
              style={{
                flex: 1,
                height: 120,
                background: WHITE_KEY_COLORS[state],
                borderRadius: "0 0 8px 8px",
                border: "1px solid #c8c0e0",
                cursor: disabled ? "default" : "pointer",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 8,
                transition: "background 0.15s",
                boxShadow:
                  state === "correct" || state === "hint"
                    ? "0 0 12px rgba(74,222,128,0.5)"
                    : state === "incorrect"
                      ? "0 0 12px rgba(248,113,113,0.5)"
                      : "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'DM Sans',sans-serif",
                  color:
                    state === "default" ? "#65607a" : "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Black keys — absolute positioned */}
      {BLACK_KEYS.map(({ note, left, label }) => {
        const state = keyStates[note] ?? "default";
        return (
          <div
            key={note}
            onPointerDown={(e) => handleKeyDown(note, e)}
            style={{
              position: "absolute",
              top: 0,
              left,
              width: "10.5%",
              height: 75,
              background: BLACK_KEY_COLORS[state],
              borderRadius: "0 0 6px 6px",
              cursor: disabled ? "default" : "pointer",
              zIndex: 10,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 6,
              transition: "background 0.15s",
              boxShadow:
                state === "correct" || state === "hint"
                  ? "0 0 10px rgba(74,222,128,0.6)"
                  : state === "incorrect"
                    ? "0 0 10px rgba(248,113,113,0.6)"
                    : "0 3px 6px rgba(0,0,0,0.6)",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Sans',sans-serif",
                color:
                  state === "default"
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(255,255,255,0.9)",
                fontWeight: 500,
                pointerEvents: "none",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
