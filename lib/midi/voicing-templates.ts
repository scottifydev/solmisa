import type {
  VoicingTemplate,
  ChordQualityExtended,
} from "@/types/standards-lab";

/**
 * Jazz chord voicing templates.
 * Each template defines a chord quality, voicing type, and the intervals
 * (in semitones from root) that make up the voicing.
 *
 * Ordered from most specific (extended) to least (triads) so the detector
 * prefers richer matches when available.
 */
export const VOICING_TEMPLATES: VoicingTemplate[] = [
  // ─── Extended voicings (9ths, 13ths) ────────────────────────
  { quality: "dom9", type: "full", intervals: [0, 4, 7, 10, 14], label: "9" },
  {
    quality: "maj9",
    type: "full",
    intervals: [0, 4, 7, 11, 14],
    label: "maj9",
  },
  { quality: "min9", type: "full", intervals: [0, 3, 7, 10, 14], label: "m9" },
  {
    quality: "dom13",
    type: "full",
    intervals: [0, 4, 7, 10, 14, 21],
    label: "13",
  },
  {
    quality: "min11",
    type: "full",
    intervals: [0, 3, 7, 10, 14, 17],
    label: "m11",
  },

  // ─── Rootless Type A (3-5-7-9 from root) ───────────────────
  {
    quality: "dom7",
    type: "rootless-a",
    intervals: [4, 7, 10, 14],
    label: "7 (rootless A)",
  },
  {
    quality: "maj7",
    type: "rootless-a",
    intervals: [4, 7, 11, 14],
    label: "maj7 (rootless A)",
  },
  {
    quality: "min7",
    type: "rootless-a",
    intervals: [3, 7, 10, 14],
    label: "m7 (rootless A)",
  },
  {
    quality: "min7b5",
    type: "rootless-a",
    intervals: [3, 6, 10, 14],
    label: "m7b5 (rootless A)",
  },

  // ─── Rootless Type B (7-9-3-5 from root) ───────────────────
  {
    quality: "dom7",
    type: "rootless-b",
    intervals: [10, 14, 16, 19],
    label: "7 (rootless B)",
  },
  {
    quality: "maj7",
    type: "rootless-b",
    intervals: [11, 14, 16, 19],
    label: "maj7 (rootless B)",
  },
  {
    quality: "min7",
    type: "rootless-b",
    intervals: [10, 14, 15, 19],
    label: "m7 (rootless B)",
  },

  // ─── Full 7th chord voicings ────────────────────────────────
  { quality: "maj7", type: "full", intervals: [0, 4, 7, 11], label: "maj7" },
  { quality: "min7", type: "full", intervals: [0, 3, 7, 10], label: "m7" },
  { quality: "dom7", type: "full", intervals: [0, 4, 7, 10], label: "7" },
  { quality: "dim7", type: "full", intervals: [0, 3, 6, 9], label: "dim7" },
  { quality: "min7b5", type: "full", intervals: [0, 3, 6, 10], label: "m7b5" },
  { quality: "6", type: "full", intervals: [0, 4, 7, 9], label: "6" },
  { quality: "min6", type: "full", intervals: [0, 3, 7, 9], label: "m6" },
  { quality: "sus4", type: "full", intervals: [0, 5, 7, 10], label: "7sus4" },
  { quality: "sus2", type: "full", intervals: [0, 2, 7, 10], label: "7sus2" },

  // ─── Shell voicings (root-3-7 or root-7-3) ─────────────────
  {
    quality: "maj7",
    type: "shell",
    intervals: [0, 4, 11],
    label: "maj7 (shell)",
  },
  {
    quality: "maj7",
    type: "shell",
    intervals: [0, 11, 16],
    label: "maj7 (shell inv)",
  },
  {
    quality: "min7",
    type: "shell",
    intervals: [0, 3, 10],
    label: "m7 (shell)",
  },
  {
    quality: "min7",
    type: "shell",
    intervals: [0, 10, 15],
    label: "m7 (shell inv)",
  },
  { quality: "dom7", type: "shell", intervals: [0, 4, 10], label: "7 (shell)" },
  {
    quality: "dom7",
    type: "shell",
    intervals: [0, 10, 16],
    label: "7 (shell inv)",
  },

  // ─── Triads ─────────────────────────────────────────────────
  { quality: "maj", type: "full", intervals: [0, 4, 7], label: "maj" },
  { quality: "min", type: "full", intervals: [0, 3, 7], label: "min" },
  { quality: "dim", type: "full", intervals: [0, 3, 6], label: "dim" },
  { quality: "aug", type: "full", intervals: [0, 4, 8], label: "aug" },
];

/** Chord symbol suffix for each quality */
export const QUALITY_SYMBOLS: Record<ChordQualityExtended, string> = {
  maj: "",
  min: "m",
  dim: "dim",
  aug: "+",
  dom7: "7",
  maj7: "maj7",
  min7: "m7",
  dim7: "dim7",
  min7b5: "m7b5",
  dom9: "9",
  min9: "m9",
  maj9: "maj9",
  dom13: "13",
  min11: "m11",
  sus4: "7sus4",
  sus2: "7sus2",
  "6": "6",
  min6: "m6",
};

/** Pitch class names in chromatic order */
const PITCH_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

/** Sharp-biased names for sharp keys */
const PITCH_NAMES_SHARP = [
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

/** Get the pitch name for a pitch class (0-11), preferring flats for jazz context */
export function pitchClassName(pc: number, preferSharps = false): string {
  const idx = ((pc % 12) + 12) % 12;
  return preferSharps ? PITCH_NAMES_SHARP[idx]! : PITCH_NAMES[idx]!;
}

/**
 * Chord tones for a given quality (pitch classes relative to root=0).
 * Used for scale-degree analysis in the notation renderer.
 */
export const CHORD_TONES: Record<ChordQualityExtended, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim7: [0, 3, 6, 9],
  min7b5: [0, 3, 6, 10],
  dom9: [0, 4, 7, 10, 14],
  min9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  dom13: [0, 4, 7, 10, 14, 21],
  min11: [0, 3, 7, 10, 14, 17],
  sus4: [0, 5, 7, 10],
  sus2: [0, 2, 7, 10],
  "6": [0, 4, 7, 9],
  min6: [0, 3, 7, 9],
};

/**
 * Available tensions for each quality (pitch classes relative to root=0).
 * These are "legal" extensions a soloist can use.
 */
export const AVAILABLE_TENSIONS: Record<ChordQualityExtended, number[]> = {
  maj: [2, 9],
  min: [2, 5, 9],
  dim: [2, 5, 8],
  aug: [2, 9],
  dom7: [2, 9], // 9, 13
  maj7: [2, 6, 9], // 9, #11, 13
  min7: [2, 5, 9], // 9, 11, 13
  dim7: [2, 5, 8], // 9, 11, b13
  min7b5: [2, 5, 8], // 9, 11, b13
  dom9: [9], // 13
  min9: [5, 9], // 11, 13
  maj9: [6, 9], // #11, 13
  dom13: [],
  min11: [9], // 13
  sus4: [2, 9], // 9, 13
  sus2: [5, 9], // 11, 13
  "6": [2], // 9
  min6: [2, 5], // 9, 11
};

/**
 * Avoid notes for each quality (pitch classes relative to root=0).
 * These create undesirable dissonance with chord tones.
 */
export const AVOID_NOTES: Record<ChordQualityExtended, number[]> = {
  maj: [5], // 4th against 3rd
  min: [],
  dim: [],
  aug: [],
  dom7: [5], // natural 4th on dominant
  maj7: [5], // natural 4th against 3rd
  min7: [],
  dim7: [],
  min7b5: [],
  dom9: [5],
  min9: [],
  maj9: [5],
  dom13: [5],
  min11: [],
  sus4: [],
  sus2: [],
  "6": [5],
  min6: [],
};
