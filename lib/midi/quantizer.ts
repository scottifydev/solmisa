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
  const { timeSignature, tempoEvents, ppq } = parsed;
  const bpm = tempoEvents[0]?.bpm ?? 120;

  const measures = quantizeToMeasures(
    melody,
    chords,
    timeSignature,
    bpm,
    ppq,
    parsed.totalBars,
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
  bpm: number,
  ppq: number,
  totalBars: number,
  sections?: TuneSection[],
): QuantizedMeasure[] {
  const beatsPerBar = timeSig.numerator;
  const beatDuration = 60 / bpm; // seconds per beat
  const barDuration = beatDuration * beatsPerBar;

  // Build measures
  const measures: QuantizedMeasure[] = [];

  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * barDuration;
    const barEnd = barStart + barDuration;

    // Get melody notes in this bar
    const barNotes = melody.filter(
      (n) => n.time >= barStart - 0.01 && n.time < barEnd - 0.01,
    );

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
): QuantizedNote[] {
  if (notes.length === 0) return [];

  const result: QuantizedNote[] = [];

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

    // Convert MIDI to VexFlow key
    const vexKey = midiToVexKey(note.midi);
    const vexDuration = beatsToVexDuration(clampedDuration);
    const accidental = getAccidental(note.midi);

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
    // Insert rest before this note if there's a gap
    const gap = note.beat - cursor;
    if (gap >= 0.4) {
      const restDuration = beatsToVexDuration(gap);
      result.push({
        keys: ["b/4"],
        duration: restDuration.vex,
        rest: true,
        dotted: restDuration.dotted,
        tied: false,
        bar: barNumber,
        beat: cursor,
      });
    }

    result.push(note);

    // Advance cursor past this note
    const noteDur = vexDurationToBeats(note.duration, note.dotted);
    cursor = note.beat + noteDur;
  }

  // Trailing rest if the bar isn't full
  const trailing = beatsPerBar + 1 - cursor;
  if (trailing >= 0.4) {
    const restDuration = beatsToVexDuration(trailing);
    result.push({
      keys: ["b/4"],
      duration: restDuration.vex,
      rest: true,
      dotted: restDuration.dotted,
      tied: false,
      bar: barNumber,
      beat: cursor,
    });
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

const NOTE_NAMES = ["c", "c", "d", "d", "e", "f", "f", "g", "g", "a", "a", "b"];
const ACCIDENTALS = [
  null,
  "#",
  null,
  "#",
  null,
  null,
  "#",
  null,
  "#",
  null,
  "#",
  null,
];

function midiToVexKey(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pc = midi % 12;
  const name = NOTE_NAMES[pc]!;
  return `${name}/${octave}`;
}

function getAccidental(midi: number): string | undefined {
  const pc = midi % 12;
  return ACCIDENTALS[pc] ?? undefined;
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
