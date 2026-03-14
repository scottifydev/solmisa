"use client";

import { useState, useEffect, useRef } from "react";
import { MusicalAlphabetBand } from "../inputs/musical-alphabet-band";

// Note pools per clef — 1 octave below to 1 octave above the staff
// Treble clef: C4 to F5 with common accidentals
const TREBLE_NOTES = [
  { name: "C", display: "C", vexKey: "c/4", octave: 4 },
  { name: "C♯", display: "C♯", vexKey: "c#/4", octave: 4, accidental: "#" },
  { name: "D", display: "D", vexKey: "d/4", octave: 4 },
  { name: "E♭", display: "E♭", vexKey: "eb/4", octave: 4, accidental: "b" },
  { name: "E", display: "E", vexKey: "e/4", octave: 4 },
  { name: "F", display: "F", vexKey: "f/4", octave: 4 },
  { name: "F♯", display: "F♯", vexKey: "f#/4", octave: 4, accidental: "#" },
  { name: "G", display: "G", vexKey: "g/4", octave: 4 },
  { name: "A♭", display: "A♭", vexKey: "ab/4", octave: 4, accidental: "b" },
  { name: "A", display: "A", vexKey: "a/4", octave: 4 },
  { name: "B♭", display: "B♭", vexKey: "bb/4", octave: 4, accidental: "b" },
  { name: "B", display: "B", vexKey: "b/4", octave: 4 },
  { name: "C", display: "C", vexKey: "c/5", octave: 5 },
  { name: "C♯", display: "C♯", vexKey: "c#/5", octave: 5, accidental: "#" },
  { name: "D", display: "D", vexKey: "d/5", octave: 5 },
  { name: "E♭", display: "E♭", vexKey: "eb/5", octave: 5, accidental: "b" },
  { name: "E", display: "E", vexKey: "e/5", octave: 5 },
  { name: "F", display: "F", vexKey: "f/5", octave: 5 },
];

// Bass clef: E2 to A3 with common accidentals
const BASS_NOTES = [
  { name: "E", display: "E", vexKey: "e/2", octave: 2 },
  { name: "F", display: "F", vexKey: "f/2", octave: 2 },
  { name: "F♯", display: "F♯", vexKey: "f#/2", octave: 2, accidental: "#" },
  { name: "G", display: "G", vexKey: "g/2", octave: 2 },
  { name: "A♭", display: "A♭", vexKey: "ab/2", octave: 2, accidental: "b" },
  { name: "A", display: "A", vexKey: "a/2", octave: 2 },
  { name: "B♭", display: "B♭", vexKey: "bb/2", octave: 2, accidental: "b" },
  { name: "B", display: "B", vexKey: "b/2", octave: 2 },
  { name: "C", display: "C", vexKey: "c/3", octave: 3 },
  { name: "C♯", display: "C♯", vexKey: "c#/3", octave: 3, accidental: "#" },
  { name: "D", display: "D", vexKey: "d/3", octave: 3 },
  { name: "E♭", display: "E♭", vexKey: "eb/3", octave: 3, accidental: "b" },
  { name: "E", display: "E", vexKey: "e/3", octave: 3 },
  { name: "F", display: "F", vexKey: "f/3", octave: 3 },
  { name: "F♯", display: "F♯", vexKey: "f#/3", octave: 3, accidental: "#" },
  { name: "G", display: "G", vexKey: "g/3", octave: 3 },
  { name: "A♭", display: "A♭", vexKey: "ab/3", octave: 3, accidental: "b" },
  { name: "A", display: "A", vexKey: "a/3", octave: 3 },
];

type NoteData = (typeof TREBLE_NOTES)[number];

let lastNoteKey: string | undefined;
function randomNote(pool: NoteData[]): NoteData {
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

async function renderNoteOnStaff(
  container: HTMLDivElement,
  clef: "treble" | "bass",
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
    svg.style.filter = "drop-shadow(0 0 4px rgba(139,92,246,0.25))";
  }
}

interface IdentifyNoteProps {
  clef: "treble" | "bass";
  onAnswer: (correct: boolean) => void;
}

export function IdentifyNote({ clef, onAnswer }: IdentifyNoteProps) {
  const pool = clef === "treble" ? TREBLE_NOTES : BASS_NOTES;
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
