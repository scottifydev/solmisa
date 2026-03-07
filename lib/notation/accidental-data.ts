export const SHARP_ORDER = ["F#", "C#", "G#", "D#", "A#", "E#", "B#"];
export const FLAT_ORDER = ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"];

export const KEY_ACCIDENTALS: Record<string, string[]> = {
  C: [],
  G: ["F#"],
  D: ["F#", "C#"],
  A: ["F#", "C#", "G#"],
  E: ["F#", "C#", "G#", "D#"],
  B: ["F#", "C#", "G#", "D#", "A#"],
  "F#": ["F#", "C#", "G#", "D#", "A#", "E#"],
  "C#": ["F#", "C#", "G#", "D#", "A#", "E#", "B#"],
  F: ["Bb"],
  Bb: ["Bb", "Eb"],
  Eb: ["Bb", "Eb", "Ab"],
  Ab: ["Bb", "Eb", "Ab", "Db"],
  Db: ["Bb", "Eb", "Ab", "Db", "Gb"],
  Gb: ["Bb", "Eb", "Ab", "Db", "Gb", "Cb"],
  Cb: ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"],
};

export const TREBLE_SHARP_POSITIONS = [
  "f/5",
  "c/5",
  "g/5",
  "d/5",
  "a/4",
  "e/5",
  "b/4",
];
export const TREBLE_FLAT_POSITIONS = [
  "b/4",
  "e/5",
  "a/4",
  "d/5",
  "g/4",
  "c/5",
  "f/4",
];
