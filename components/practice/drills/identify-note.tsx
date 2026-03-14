"use client";

import { useState, useEffect, useRef } from "react";
import { MusicalAlphabetBand } from "../inputs/musical-alphabet-band";

export type ClefType = "treble" | "bass" | "alto";

// Note pools per clef — 1 octave below to 1 octave above the staff
// Treble clef: C4 to F5 with common accidentals
const TREBLE_NOTES = [
  { name: "C", vexKey: "c/4", accidental: undefined as string | undefined },
  { name: "C♯", vexKey: "c#/4", accidental: "#" },
  { name: "D", vexKey: "d/4", accidental: undefined as string | undefined },
  { name: "E♭", vexKey: "eb/4", accidental: "b" },
  { name: "E", vexKey: "e/4", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/4", accidental: undefined as string | undefined },
  { name: "F♯", vexKey: "f#/4", accidental: "#" },
  { name: "G", vexKey: "g/4", accidental: undefined as string | undefined },
  { name: "A♭", vexKey: "ab/4", accidental: "b" },
  { name: "A", vexKey: "a/4", accidental: undefined as string | undefined },
  { name: "B♭", vexKey: "bb/4", accidental: "b" },
  { name: "B", vexKey: "b/4", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/5", accidental: undefined as string | undefined },
  { name: "C♯", vexKey: "c#/5", accidental: "#" },
  { name: "D", vexKey: "d/5", accidental: undefined as string | undefined },
  { name: "E♭", vexKey: "eb/5", accidental: "b" },
  { name: "E", vexKey: "e/5", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/5", accidental: undefined as string | undefined },
];

// Bass clef: E2 to A3 with common accidentals
const BASS_NOTES = [
  { name: "E", vexKey: "e/2", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/2", accidental: undefined as string | undefined },
  { name: "F♯", vexKey: "f#/2", accidental: "#" },
  { name: "G", vexKey: "g/2", accidental: undefined as string | undefined },
  { name: "A♭", vexKey: "ab/2", accidental: "b" },
  { name: "A", vexKey: "a/2", accidental: undefined as string | undefined },
  { name: "B♭", vexKey: "bb/2", accidental: "b" },
  { name: "B", vexKey: "b/2", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/3", accidental: undefined as string | undefined },
  { name: "C♯", vexKey: "c#/3", accidental: "#" },
  { name: "D", vexKey: "d/3", accidental: undefined as string | undefined },
  { name: "E♭", vexKey: "eb/3", accidental: "b" },
  { name: "E", vexKey: "e/3", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/3", accidental: undefined as string | undefined },
  { name: "F♯", vexKey: "f#/3", accidental: "#" },
  { name: "G", vexKey: "g/3", accidental: undefined as string | undefined },
  { name: "A♭", vexKey: "ab/3", accidental: "b" },
  { name: "A", vexKey: "a/3", accidental: undefined as string | undefined },
];

// Alto clef: F3 to B4 with common accidentals
const ALTO_NOTES = [
  { name: "F", vexKey: "f/3", accidental: undefined as string | undefined },
  { name: "F♯", vexKey: "f#/3", accidental: "#" },
  { name: "G", vexKey: "g/3", accidental: undefined as string | undefined },
  { name: "A♭", vexKey: "ab/3", accidental: "b" },
  { name: "A", vexKey: "a/3", accidental: undefined as string | undefined },
  { name: "B♭", vexKey: "bb/3", accidental: "b" },
  { name: "B", vexKey: "b/3", accidental: undefined as string | undefined },
  { name: "C", vexKey: "c/4", accidental: undefined as string | undefined },
  { name: "C♯", vexKey: "c#/4", accidental: "#" },
  { name: "D", vexKey: "d/4", accidental: undefined as string | undefined },
  { name: "E♭", vexKey: "eb/4", accidental: "b" },
  { name: "E", vexKey: "e/4", accidental: undefined as string | undefined },
  { name: "F", vexKey: "f/4", accidental: undefined as string | undefined },
  { name: "F♯", vexKey: "f#/4", accidental: "#" },
  { name: "G", vexKey: "g/4", accidental: undefined as string | undefined },
  { name: "A♭", vexKey: "ab/4", accidental: "b" },
  { name: "A", vexKey: "a/4", accidental: undefined as string | undefined },
  { name: "B♭", vexKey: "bb/4", accidental: "b" },
  { name: "B", vexKey: "b/4", accidental: undefined as string | undefined },
];

const NOTE_POOLS: Record<ClefType, typeof TREBLE_NOTES> = {
  treble: TREBLE_NOTES,
  bass: BASS_NOTES,
  alto: ALTO_NOTES,
};

type NoteData = (typeof TREBLE_NOTES)[number];

let lastNoteKey: string | undefined;
export function randomNote(pool: NoteData[]): NoteData {
  for (let i = 0; i < 3; i++) {
    const note = pool[Math.floor(Math.random() * pool.length)]!;
    if (note.vexKey !== lastNoteKey || pool.length <= 1) {
      lastNoteKey = note.vexKey;
      return note;
    }
  }
  const note = pool[Math.floor(Math.random() * pool.length)]!;
  lastNoteKey = note.vexKey;
  return note;
}

export async function renderNoteOnStaff(
  container: HTMLDivElement,
  clef: ClefType,
  note: NoteData,
  color: string,
) {
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } =
    await import("vexflow");

  container.innerHTML = "";

  const W = 240;
  const H = 140;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(W, H);

  const context = renderer.getContext();
  context.setFillStyle(color);
  context.setStrokeStyle("#3a3a4e");

  const stave = new Stave(10, 25, W - 20);
  stave.addClef(clef);
  stave.setStyle({ fillStyle: "#3a3a4e", strokeStyle: "#3a3a4e" });
  stave.setContext(context);
  stave.draw();

  const staveNote = new StaveNote({
    keys: [note.vexKey],
    duration: "q",
    clef,
  });

  if (note.accidental) {
    staveNote.addModifier(new Accidental(note.accidental), 0);
  }

  staveNote.setStyle({ fillStyle: color, strokeStyle: color });

  const voice = new Voice({ numBeats: 1, beatValue: 4 });
  voice.setMode(2);
  voice.addTickables([staveNote]);
  new Formatter().joinVoices([voice]).format([voice], 140);
  voice.draw(context, stave);

  const svg = container.querySelector("svg");
  if (svg) {
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.filter = "drop-shadow(0 0 4px rgba(237,233,254,0.25))";
  }
}

interface IdentifyNoteProps {
  clef: ClefType;
  onAnswer: (correct: boolean) => void;
}

export function IdentifyNote({ clef, onAnswer }: IdentifyNoteProps) {
  const pool = NOTE_POOLS[clef];
  const [note] = useState(() => randomNote(pool));
  const [answered, setAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      renderNoteOnStaff(containerRef.current, clef, note, "#ede9fe");
    }
  }, [clef, note]);

  function handleAnswer(correct: boolean) {
    if (answered) return;
    setAnswered(true);
    if (containerRef.current) {
      renderNoteOnStaff(
        containerRef.current,
        clef,
        note,
        correct ? "#4ade80" : "#f87171",
      );
    }
    onAnswer(correct);
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
      <div ref={containerRef} style={{ width: "100%", maxWidth: 260 }} />
      <MusicalAlphabetBand
        correctAnswer={note.name}
        onAnswer={(correct) => handleAnswer(correct)}
        disabled={answered}
      />
    </div>
  );
}
