import type {
  MidiNoteEvent,
  AnalyzedChord,
  TimeSignature,
  QuantizedNote,
  QuantizedMeasure,
  NoteCategory,
  StandardNotation,
  ParsedStandard,
  TuneSection,
} from "@/types/standards-lab";
import {
  CHORD_TONES,
  AVAILABLE_TENSIONS,
  AVOID_NOTES,
} from "./voicing-templates";

// ─── Main Entry ──────────────────────────────────────────────

export function buildNotation(
  parsed: ParsedStandard,
  chords: AnalyzedChord[],
  sections?: TuneSection[],
): StandardNotation {
  const { melody } = parsed.tracks;
  const { timeSignature, ppq } = parsed;

  const measures = quantizeToMeasures(
    melody,
    chords,
    timeSignature,
    parsed.barStartTimes,
    ppq,
    parsed.totalBars,
    buildKeyContext(parsed.keySignature),
    sections,
  );

  return {
    measures,
    keySignature: parsed.keySignature,
    timeSignature,
    title: parsed.title,
  };
}

// ─── Quantization ────────────────────────────────────────────

const VEXFLOW_DURATIONS: { ticks: number; vex: string; dotted: boolean }[] = [
  { ticks: 4, vex: "w", dotted: false }, // whole
  { ticks: 3, vex: "hd", dotted: true }, // dotted half
  { ticks: 2, vex: "h", dotted: false }, // half
  { ticks: 1.5, vex: "qd", dotted: true }, // dotted quarter
  { ticks: 1, vex: "q", dotted: false }, // quarter
  { ticks: 0.75, vex: "8d", dotted: true }, // dotted 8th
  { ticks: 0.5, vex: "8", dotted: false }, // 8th
  { ticks: 0.25, vex: "16", dotted: false }, // 16th
];

function quantizeToMeasures(
  melody: MidiNoteEvent[],
  chords: AnalyzedChord[],
  timeSig: TimeSignature,
  barStartTimes: number[],
  ppq: number,
  totalBars: number,
  key: KeyContext,
  sections?: TuneSection[],
): QuantizedMeasure[] {
  const beatsPerBar = timeSig.numerator;

  // Group notes by the bar the parser assigned them, which comes from ticks
  // through the file's tempo map. Deriving bars here from a single BPM put
  // notes in the wrong measures for every file with a tempo change.
  const notesByBar = new Map<number, MidiNoteEvent[]>();
  for (const note of melody) {
    const existing = notesByBar.get(note.bar);
    if (existing) existing.push(note);
    else notesByBar.set(note.bar, [note]);
  }

  // Build measures
  const measures: QuantizedMeasure[] = [];

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = barStartTimes[bar] ?? 0;
    // The last bar has no following downbeat, so fall back to the previous
    // bar's length, or to the file's own average if there is only one bar.
    const nextStart = barStartTimes[bar + 1];
    const barDuration =
      nextStart !== undefined
        ? nextStart - barStart
        : (barStartTimes[bar] ?? 0) - (barStartTimes[bar - 1] ?? 0) || 2;
    const beatDuration = barDuration / beatsPerBar;

    const barNotes = notesByBar.get(bar) ?? [];

    // Get active chord at bar start
    const activeChord = findChordAtTime(chords, barStart);

    // Get section label
    const rehearsalMark = sections?.find((s) => s.startBar === bar)?.label;

    // Quantize notes to beat grid
    const quantized = quantizeBarNotes(
      barNotes,
      barStart,
      barDuration,
      beatDuration,
      beatsPerBar,
      bar,
      activeChord,
      key,
    );

    // Fill gaps with rests
    const withRests = fillRests(quantized, beatsPerBar, bar);

    measures.push({
      notes: withRests,
      chordSymbol: activeChord?.symbol,
      chord: activeChord ?? undefined,
      barNumber: bar,
      rehearsalMark,
    });
  }

  return measures;
}

function quantizeBarNotes(
  notes: MidiNoteEvent[],
  barStart: number,
  barDuration: number,
  beatDuration: number,
  beatsPerBar: number,
  barNumber: number,
  activeChord: AnalyzedChord | null,
  key: KeyContext,
): QuantizedNote[] {
  if (notes.length === 0) return [];

  const result: QuantizedNote[] = [];
  // Accidentals carry to the end of the bar, then reset.
  const barAlterations = new Map<string, number>();

  for (const note of notes) {
    // Quantize onset to nearest 8th note
    const relativeTime = note.time - barStart;
    const beatPosition = relativeTime / beatDuration;
    const quantizedBeat = Math.round(beatPosition * 2) / 2; // snap to 8th

    // Quantize duration
    const durationBeats = note.duration / beatDuration;
    const quantizedDuration = snapDuration(durationBeats);

    // Clamp to bar boundary
    const remainingBeats = beatsPerBar - quantizedBeat;
    const clampedDuration = Math.min(quantizedDuration, remainingBeats);

    if (clampedDuration <= 0) continue;

    // Convert MIDI to VexFlow key, spelled for the current key signature
    const { vexKey, accidental } = spellNote(note.midi, key, barAlterations);
    const vexDuration = beatsToVexDuration(clampedDuration);

    // Classify note against active chord
    const category = activeChord
      ? classifyNote(note.midi, activeChord)
      : undefined;
    const degree = activeChord
      ? getScaleDegree(note.midi, activeChord.rootMidi)
      : undefined;

    result.push({
      keys: [vexKey],
      duration: vexDuration.vex,
      rest: false,
      dotted: vexDuration.dotted,
      tied: false,
      accidental,
      bar: barNumber,
      beat: quantizedBeat + 1,
      degree,
      noteCategory: category,
    });
  }

  return result;
}

function snapDuration(beats: number): number {
  // Snap to the nearest standard duration
  const grid = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
  let best = 0.5;
  let bestDiff = Infinity;
  for (const g of grid) {
    const diff = Math.abs(beats - g);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = g;
    }
  }
  return best;
}

function beatsToVexDuration(beats: number): {
  vex: string;
  dotted: boolean;
} {
  for (const d of VEXFLOW_DURATIONS) {
    if (Math.abs(d.ticks - beats) < 0.15) {
      return { vex: d.vex.replace("d", ""), dotted: d.dotted };
    }
  }
  // Default to quarter
  return { vex: "q", dotted: false };
}

/** Smallest duration the grid can express, in beats. */
const MIN_GRID_BEATS = 0.25;

/**
 * Express a span of beats as a sequence of notatable durations, longest first.
 *
 * A single lookup cannot do this: a 2.5-beat gap matches no grid entry, and the
 * old code silently emitted one quarter note for it, so the bar no longer added
 * up to the time signature and VexFlow drew a short measure.
 */
export function decomposeBeats(
  beats: number,
): { vex: string; dotted: boolean; beats: number }[] {
  const out: { vex: string; dotted: boolean; beats: number }[] = [];
  let remaining = beats;

  // Guard against a non-finite or negative span rather than looping forever.
  if (!Number.isFinite(remaining) || remaining < MIN_GRID_BEATS) return out;

  while (remaining >= MIN_GRID_BEATS) {
    const fit = VEXFLOW_DURATIONS.find((d) => d.ticks <= remaining + 1e-6);
    if (!fit) break;
    out.push({
      vex: fit.vex.replace("d", ""),
      dotted: fit.dotted,
      beats: fit.ticks,
    });
    remaining -= fit.ticks;
  }

  return out;
}

// ─── Rest Filling ────────────────────────────────────────────

function fillRests(
  notes: QuantizedNote[],
  beatsPerBar: number,
  barNumber: number,
): QuantizedNote[] {
  if (notes.length === 0) {
    // Whole bar rest
    return [
      {
        keys: ["b/4"],
        duration: "w",
        rest: true,
        dotted: false,
        tied: false,
        bar: barNumber,
        beat: 1,
      },
    ];
  }

  // Sort by beat position
  const sorted = [...notes].sort((a, b) => a.beat - b.beat);
  const result: QuantizedNote[] = [];
  let cursor = 1; // current beat position (1-indexed)

  for (const note of sorted) {
    // Fill any gap before this note with rests that add up exactly.
    let restBeat = cursor;
    for (const rest of decomposeBeats(note.beat - cursor)) {
      result.push({
        keys: ["b/4"],
        duration: rest.vex,
        rest: true,
        dotted: rest.dotted,
        tied: false,
        bar: barNumber,
        beat: restBeat,
      });
      restBeat += rest.beats;
    }

    result.push(note);

    // Advance cursor past this note
    const noteDur = vexDurationToBeats(note.duration, note.dotted);
    cursor = note.beat + noteDur;
  }

  // Trailing rests if the bar isn't full
  let trailingBeat = cursor;
  for (const rest of decomposeBeats(beatsPerBar + 1 - cursor)) {
    result.push({
      keys: ["b/4"],
      duration: rest.vex,
      rest: true,
      dotted: rest.dotted,
      tied: false,
      bar: barNumber,
      beat: trailingBeat,
    });
    trailingBeat += rest.beats;
  }

  return result;
}

function vexDurationToBeats(vex: string, dotted: boolean): number {
  const base: Record<string, number> = {
    w: 4,
    h: 2,
    q: 1,
    "8": 0.5,
    "16": 0.25,
    "32": 0.125,
  };
  const beats = base[vex] ?? 1;
  return dotted ? beats * 1.5 : beats;
}

// ─── MIDI → VexFlow Helpers ──────────────────────────────────

// Letters altered by each major key signature, in the order they appear on the
// stave. Derived from the same string passed to Stave.addKeySignature so the
// spelling always agrees with the accidentals actually drawn.
const SHARP_ORDER = ["f", "c", "g", "d", "a", "e", "b"];
const FLAT_ORDER = ["b", "e", "a", "d", "g", "c", "f"];

const SHARP_KEYS: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
};

const FLAT_KEYS: Record<string, number> = {
  F: 1,
  Bb: 2,
  Eb: 3,
  Ab: 4,
  Db: 5,
  Gb: 6,
  Cb: 7,
};

/** Natural-letter spelling for the seven white pitch classes. */
const WHITE_KEYS: Record<number, string> = {
  0: "c",
  2: "d",
  4: "e",
  5: "f",
  7: "g",
  9: "a",
  11: "b",
};

/** Both enharmonic spellings for the five black pitch classes. */
const BLACK_KEYS: Record<number, { sharp: string; flat: string }> = {
  1: { sharp: "c", flat: "d" },
  3: { sharp: "d", flat: "e" },
  6: { sharp: "f", flat: "g" },
  8: { sharp: "g", flat: "a" },
  10: { sharp: "a", flat: "b" },
};

export interface KeyContext {
  /** letter -> -1 flat, 0 natural, +1 sharp, as fixed by the key signature */
  alterations: Record<string, number>;
  /** true when the key signature is written with flats */
  prefersFlats: boolean;
}

export function buildKeyContext(keySignature: string | undefined): KeyContext {
  const alterations: Record<string, number> = {};
  // NotationView draws `keySignature.replace("m", "")`, so read the same name.
  const name = (keySignature ?? "C").replace("m", "");

  const flats = FLAT_KEYS[name];
  if (flats !== undefined) {
    for (let i = 0; i < flats; i++) alterations[FLAT_ORDER[i]!] = -1;
    return { alterations, prefersFlats: true };
  }

  const sharps = SHARP_KEYS[name] ?? 0;
  for (let i = 0; i < sharps; i++) alterations[SHARP_ORDER[i]!] = 1;
  return { alterations, prefersFlats: false };
}

const ACCIDENTAL_SYMBOL: Record<number, string> = {
  [-1]: "b",
  0: "n",
  1: "#",
};

/**
 * Spell a MIDI note for the given key, emitting an accidental only when the
 * note differs from what is already in force. `barAlterations` carries the
 * accidentals seen earlier in the same bar, which override the key signature
 * until the barline, so a natural does not silently apply to later notes.
 */
export function spellNote(
  midi: number,
  key: KeyContext,
  barAlterations: Map<string, number>,
): { vexKey: string; accidental?: string } {
  const octave = Math.floor(midi / 12) - 1;
  const pc = midi % 12;

  let letter: string;
  let alter: number;

  const white = WHITE_KEYS[pc];
  if (white !== undefined) {
    letter = white;
    alter = 0;
  } else {
    const black = BLACK_KEYS[pc]!;
    if (key.prefersFlats) {
      letter = black.flat;
      alter = -1;
    } else {
      letter = black.sharp;
      alter = 1;
    }
    // If the key signature already alters the other spelling's letter, use it
    // so the note needs no accidental (Eb in Eb major, F# in G major).
    const alternate = key.prefersFlats
      ? { letter: black.sharp, alter: 1 }
      : { letter: black.flat, alter: -1 };
    if (
      key.alterations[letter] !== alter &&
      key.alterations[alternate.letter] === alternate.alter
    ) {
      letter = alternate.letter;
      alter = alternate.alter;
    }
  }

  const scoped = `${letter}${octave}`;
  const inForce = barAlterations.has(scoped)
    ? barAlterations.get(scoped)!
    : (key.alterations[letter] ?? 0);

  let accidental: string | undefined;
  if (alter !== inForce) {
    accidental = ACCIDENTAL_SYMBOL[alter];
    barAlterations.set(scoped, alter);
  }

  return { vexKey: `${letter}/${octave}`, accidental };
}

// ─── Note Classification ─────────────────────────────────────

function classifyNote(midi: number, chord: AnalyzedChord): NoteCategory {
  const notePc = midi % 12;
  const rootPc = chord.rootMidi % 12;
  const interval = (notePc - rootPc + 12) % 12;

  if (interval === 0) return "root";

  const chordTones = CHORD_TONES[chord.quality] ?? [];
  if (chordTones.map((i) => i % 12).includes(interval)) return "chord-tone";

  const tensions = AVAILABLE_TENSIONS[chord.quality] ?? [];
  if (tensions.includes(interval)) return "tension";

  const avoid = AVOID_NOTES[chord.quality] ?? [];
  if (avoid.includes(interval)) return "avoid";

  return "chromatic";
}

function getScaleDegree(midi: number, rootMidi: number): number {
  return ((midi % 12) - (rootMidi % 12) + 12) % 12;
}

// ─── Chord Lookup ────────────────────────────────────────────

function findChordAtTime(
  chords: AnalyzedChord[],
  time: number,
): AnalyzedChord | null {
  // Find the last chord that started before or at this time
  let active: AnalyzedChord | null = null;
  for (const chord of chords) {
    if (chord.time <= time + 0.05) {
      active = chord;
    } else {
      break;
    }
  }
  return active;
}
