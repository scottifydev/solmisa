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

export const BASS_SHARP_POSITIONS = [
  "f/3",
  "c/3",
  "g/3",
  "d/3",
  "a/2",
  "e/3",
  "b/2",
];
export const BASS_FLAT_POSITIONS = [
  "b/2",
  "e/3",
  "a/2",
  "d/3",
  "g/2",
  "c/3",
  "f/2",
];

export const ALTO_SHARP_POSITIONS = [
  "f/4",
  "c/4",
  "g/4",
  "d/4",
  "a/3",
  "e/4",
  "b/3",
];
export const ALTO_FLAT_POSITIONS = [
  "b/3",
  "e/4",
  "a/3",
  "d/4",
  "g/3",
  "c/4",
  "f/3",
];

export const TENOR_SHARP_POSITIONS = [
  "f/3",
  "c/4",
  "g/3",
  "d/4",
  "a/3",
  "e/4",
  "b/3",
];
export const TENOR_FLAT_POSITIONS = [
  "b/3",
  "e/3",
  "a/3",
  "d/4",
  "g/3",
  "c/4",
  "f/3",
];
