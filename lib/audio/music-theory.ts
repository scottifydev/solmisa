import type { NoteName } from "@/types/audio";

export const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const SEMITONE_TO_NOTE: string[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/** Strip trailing octave digits from a key name (e.g. "C4" -> "C") */
export function stripOctave(key: string): NoteName {
  return key.replace(/\d+$/, "") as NoteName;
}

export function noteToMidi(name: NoteName, octave: number): number {
  const clean = stripOctave(name);
  const semi = NOTE_SEMITONES[clean];
  if (semi === undefined) throw new Error(`Unknown note: ${name}`);
  return (octave + 1) * 12 + semi;
}

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = SEMITONE_TO_NOTE[midi % 12]!;
  return `${note}${octave}`;
}
