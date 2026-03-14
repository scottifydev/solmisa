"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PianoKeyboard, type NoteKey } from "../inputs/piano-keyboard";
import {
  type ClefType,
  randomNote,
  renderNoteOnStaff,
} from "./identify-note";

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

// ── Note pools per clef ─────────────────────────────────────────────────────
const TREBLE_NOTES = [
  { name: "C", vexKey: "c/4", tone: "C4", accidental: undefined as string | undefined },
  { name: "D", vexKey: "d/4", tone: "D4", accidental: undefined as string | undefined },
  { name: "E", vexKey: "e/4", tone: "E4", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/4", tone: "F4", accidental: undefined as string | undefined },
  { name: "G", vexKey: "g/4", tone: "G4", accidental: undefined as string | undefined },
  { name: "A", vexKey: "a/4", tone: "A4", accidental: undefined as string | undefined },
  { name: "B", vexKey: "b/4", tone: "B4", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/5", tone: "C5", accidental: undefined as string | undefined },
  { name: "D", vexKey: "d/5", tone: "D5", accidental: undefined as string | undefined },
  { name: "E", vexKey: "e/5", tone: "E5", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/5", tone: "F5", accidental: undefined as string | undefined },
];

const BASS_NOTES = [
  { name: "E", vexKey: "e/2", tone: "E2", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/2", tone: "F2", accidental: undefined as string | undefined },
  { name: "G", vexKey: "g/2", tone: "G2", accidental: undefined as string | undefined },
  { name: "A", vexKey: "a/2", tone: "A2", accidental: undefined as string | undefined },
  { name: "B", vexKey: "b/2", tone: "B2", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/3", tone: "C3", accidental: undefined as string | undefined },
  { name: "D", vexKey: "d/3", tone: "D3", accidental: undefined as string | undefined },
  { name: "E", vexKey: "e/3", tone: "E3", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/3", tone: "F3", accidental: undefined as string | undefined },
  { name: "G", vexKey: "g/3", tone: "G3", accidental: undefined as string | undefined },
  { name: "A", vexKey: "a/3", tone: "A3", accidental: undefined as string | undefined },
];

const ALTO_NOTES = [
  { name: "F", vexKey: "f/3", tone: "F3", accidental: undefined as string | undefined },
  { name: "G", vexKey: "g/3", tone: "G3", accidental: undefined as string | undefined },
  { name: "A", vexKey: "a/3", tone: "A3", accidental: undefined as string | undefined },
  { name: "B", vexKey: "b/3", tone: "B3", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/4", tone: "C4", accidental: undefined as string | undefined },
  { name: "D", vexKey: "d/4", tone: "D4", accidental: undefined as string | undefined },
  { name: "E", vexKey: "e/4", tone: "E4", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/4", tone: "F4", accidental: undefined as string | undefined },
  { name: "G", vexKey: "g/4", tone: "G4", accidental: undefined as string | undefined },
  { name: "A", vexKey: "a/4", tone: "A4", accidental: undefined as string | undefined },
  { name: "B", vexKey: "b/4", tone: "B4", accidental: undefined as string | undefined },
];

type PlayNote = (typeof TREBLE_NOTES)[number];

const PLAY_POOLS: Record<ClefType, PlayNote[]> = {
  treble: TREBLE_NOTES,
  bass: BASS_NOTES,
  alto: ALTO_NOTES,
};

let lastPlayNote: string | undefined;
function randomPlayNote(pool: PlayNote[]): PlayNote {
  for (let i = 0; i < 3; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)]!;
    if (note.vexKey !== lastPlayNote || pool.length <= 1) {
      lastPlayNote = note.vexKey;
      return note;
    }
  }
  const note = pool[Math.floor(Math.random() * pool.length)]!;
  lastPlayNote = note.vexKey;
  return note;
}

// ── Component ──────────────────────────────────────────────────────────────
interface PlayThisNoteProps {
  onAnswer: (correct: boolean) => void;
  clef?: ClefType;
}

export function PlayThisNote({
  onAnswer,
  clef = "treble",
}: PlayThisNoteProps) {
  const pool = PLAY_POOLS[clef];
  const [target] = useState(() => randomPlayNote(pool));
  const [keyStates, setKeyStates] = useState<
    Partial<Record<NoteKey, "default" | "correct" | "incorrect" | "hint">>
  >({});
  const [answered, setAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render staff on mount
  useEffect(() => {
    if (containerRef.current) {
      renderNoteOnStaff(containerRef.current, clef, target, "#ede9fe");
    }
  }, [clef, target]);

  const handleKeyPress = useCallback(
    async (pressedKey: NoteKey) => {
      if (answered) return;

      const targetKey = target.name as NoteKey;
      const isCorrect = pressedKey === targetKey;

      // Play the pressed note immediately
      const octave = target.tone.match(/\d+/)?.[0] ?? "4";
      await playNote(`${pressedKey}${octave}`);

      if (isCorrect) {
        setAnswered(true);
        setKeyStates({ [pressedKey]: "correct" });
        if (containerRef.current) {
          renderNoteOnStaff(containerRef.current, clef, target, "#4ade80");
        }
        onAnswer(true);
      } else {
        setKeyStates({ [pressedKey]: "incorrect" });
        setTimeout(async () => {
          setAnswered(true);
          setKeyStates({ [pressedKey]: "incorrect", [targetKey]: "hint" });
          await playNote(target.tone);
          if (containerRef.current) {
            renderNoteOnStaff(containerRef.current, clef, target, "#4ade80");
          }
          onAnswer(false);
        }, 500);
      }
    },
    [answered, target, clef, onAnswer],
  );

  function handleIDontKnow() {
    if (answered) return;
    const targetKey = target.name as NoteKey;
    setAnswered(true);
    setKeyStates({ [targetKey]: "hint" });
    playNote(target.tone);
    if (containerRef.current) {
      renderNoteOnStaff(containerRef.current, clef, target, "#4ade80");
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
