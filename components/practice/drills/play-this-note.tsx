"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PianoKeyboard, type NoteKey } from "../inputs/piano-keyboard";

// ── Audio ──────────────────────────────────────────────────────────────────
let synth: import("tone").FMSynth | null = null;
let audioReady = false;

async function ensureAudio() {
  if (audioReady) return;
  const Tone = await import("tone");
  await Tone.start();
  synth = new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 2,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
    modulation: { type: "square" },
    modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.5 },
    volume: -8,
  }).toDestination();
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 });
  await reverb.ready;
  synth.connect(reverb);
  reverb.toDestination();
  audioReady = true;
}

async function playNote(note: string) {
  await ensureAudio();
  if (synth) synth.triggerAttackRelease(note, "8n");
}

// ── Note data ──────────────────────────────────────────────────────────────
const NOTES_BEGINNER: string[] = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
];
const NOTES_ADVANCED: string[] = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
  "D5",
  "E5",
];

function noteToKey(note: string): NoteKey {
  return note.replace(/\d/, "") as NoteKey;
}

function randomNote(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? "C4";
}

// ── VexFlow staff renderer ─────────────────────────────────────────────────
async function renderNoteStaff(
  container: HTMLDivElement,
  note: string,
  color: string = "#ede9fe",
) {
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } =
    await import("vexflow");

  container.innerHTML = "";

  const W = 260;
  const H = 140;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(W, H);

  const context = renderer.getContext();
  context.setFillStyle(color);
  context.setStrokeStyle("#3a3a4e");

  const stave = new Stave(10, 30, W - 20);
  stave.addClef("treble");
  stave.setStyle({ fillStyle: "#3a3a4e", strokeStyle: "#3a3a4e" });
  stave.setContext(context);
  stave.draw();

  // Parse note: "C4" → key "c/4", accidental "#" or "b" if present
  const noteName = note.replace(/\d/, "").toLowerCase();
  const octave = note.match(/\d+/)?.[0] ?? "4";
  const hasSharp = noteName.includes("#");
  const hasFlat = noteName.includes("b") && noteName.length > 1;
  const baseName = noteName.replace(/[#b]/, "");
  const vexKey = `${baseName}/${octave}`;

  const staveNote = new StaveNote({
    keys: [vexKey],
    duration: "q",
    clef: "treble",
  });

  if (hasSharp) staveNote.addModifier(new Accidental("#"), 0);
  if (hasFlat) staveNote.addModifier(new Accidental("b"), 0);

  staveNote.setStyle({ fillStyle: color, strokeStyle: color });

  const voice = new Voice({ numBeats: 1, beatValue: 4 });
  voice.setMode(2); // SOFT
  voice.addTickables([staveNote]);
  new Formatter().joinVoices([voice]).format([voice], 160);
  voice.draw(context, stave);

  const svg = container.querySelector("svg");
  if (svg) {
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.filter = "drop-shadow(0 0 4px rgba(139,92,246,0.3))";
  }
}

// ── Component ──────────────────────────────────────────────────────────────
interface PlayThisNoteProps {
  onAnswer: (correct: boolean) => void;
  range?: "beginner" | "advanced";
}

export function PlayThisNote({
  onAnswer,
  range = "beginner",
}: PlayThisNoteProps) {
  const pool = range === "advanced" ? NOTES_ADVANCED : NOTES_BEGINNER;
  const [targetNote] = useState(() => randomNote(pool));
  const [keyStates, setKeyStates] = useState<
    Partial<Record<NoteKey, "default" | "correct" | "incorrect" | "hint">>
  >({});
  const [answered, setAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const noteColor = useRef("#ede9fe");

  // Render staff on mount
  useEffect(() => {
    if (containerRef.current) {
      renderNoteStaff(containerRef.current, targetNote, noteColor.current);
    }
  }, [targetNote]);

  const handleKeyPress = useCallback(
    async (pressedKey: NoteKey) => {
      if (answered) return;

      const targetKey = noteToKey(targetNote);
      const isCorrect = pressedKey === targetKey;

      // Play the pressed note immediately
      const octave = targetNote.match(/\d+/)?.[0] ?? "4";
      await playNote(`${pressedKey}${octave}`);

      if (isCorrect) {
        setAnswered(true);
        setKeyStates({ [pressedKey]: "correct" });
        noteColor.current = "#4ade80";
        if (containerRef.current) {
          renderNoteStaff(containerRef.current, targetNote, "#4ade80");
        }
        onAnswer(true);
      } else {
        // Flash wrong key red
        setKeyStates({ [pressedKey]: "incorrect" });
        setTimeout(async () => {
          // Then show correct key green and play it
          setAnswered(true);
          setKeyStates({ [pressedKey]: "incorrect", [targetKey]: "hint" });
          await playNote(targetNote);
          noteColor.current = "#4ade80";
          if (containerRef.current) {
            renderNoteStaff(containerRef.current, targetNote, "#4ade80");
          }
          onAnswer(false);
        }, 500);
      }
    },
    [answered, targetNote, onAnswer],
  );

  function handleIDontKnow() {
    if (answered) return;
    const targetKey = noteToKey(targetNote);
    setAnswered(true);
    setKeyStates({ [targetKey]: "hint" });
    playNote(targetNote);
    noteColor.current = "#4ade80";
    if (containerRef.current) {
      renderNoteStaff(containerRef.current, targetNote, "#4ade80");
    }
    onAnswer(false);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        width: "100%",
      }}
    >
      {/* Staff */}
      <div ref={containerRef} style={{ width: "100%" }} />

      {/* Keyboard */}
      <PianoKeyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
        disabled={answered}
      />

      {/* IDK */}
      {!answered && (
        <button
          onClick={handleIDontKnow}
          style={{
            background: "none",
            border: "none",
            color: "#3d3852",
            fontSize: 12,
            fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer",
            padding: "4px 12px",
          }}
        >
          I don&apos;t know yet
        </button>
      )}
    </div>
  );
}
