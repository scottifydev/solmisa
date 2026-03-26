import { Midi } from "@tonejs/midi";
import type {
  MidiNoteEvent,
  ParsedStandard,
  TempoEvent,
  TimeSignature,
} from "@/types/standards-lab";

/**
 * Fetch a .mid file from URL and parse into structured note data.
 */
export async function fetchAndParseMidi(
  url: string,
  title?: string,
): Promise<ParsedStandard> {
  const midi = await Midi.fromUrl(url);
  return parseMidi(midi, title);
}

/**
 * Parse a Midi object from an ArrayBuffer (e.g. file upload).
 */
export function parseMidiFromBuffer(
  buffer: ArrayBuffer,
  title?: string,
): ParsedStandard {
  const midi = new Midi(buffer);
  return parseMidi(midi, title);
}

function parseMidi(midi: Midi, title?: string): ParsedStandard {
  const header = midi.header;

  // Find the piano track — widest MIDI range and most notes
  const pianoTrack = findPianoTrack(midi);
  const pianoNotes = pianoTrack ? extractNoteEvents(pianoTrack, header) : [];

  // Split the piano track into melody (RH) and harmony (LH)
  const { melody, harmony } = splitPianoTrack(pianoNotes);

  const tempoEvents = extractTempoEvents(header);
  const timeSignature = extractTimeSignature(header);
  const keySignature = extractKeySignature(header);
  const textEvents = extractTextEvents(header);

  const allNotes = [...melody, ...harmony];
  const totalBars =
    allNotes.length > 0 ? Math.max(...allNotes.map((n) => n.bar)) + 1 : 0;

  return {
    title: title ?? midi.name ?? "Untitled",
    tracks: { melody, harmony },
    tempoEvents,
    timeSignature,
    keySignature,
    durationSeconds: midi.duration,
    totalBars,
    ppq: header.ppq,
    textEvents,
  };
}

// ─── Piano Track Detection ───────────────────────────────────

function findPianoTrack(midi: Midi): Midi["tracks"][number] | null {
  const noteTracks = midi.tracks.filter((t) => t.notes.length > 0);
  if (noteTracks.length === 0) return null;

  // Score each track — piano tracks have wide pitch range and many notes
  const scored = noteTracks.map((track) => {
    const pitches = track.notes.map((n) => n.midi);
    const range = Math.max(...pitches) - Math.min(...pitches);
    const noteCount = track.notes.length;
    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;

    // Prefer tracks with:
    // - Wide range (both hands, typically 50+ semitones)
    // - Many notes
    // - Average pitch around middle C area (55-75)
    // - Name suggesting piano
    const nameBonus = /piano|keyboard|keys|played/i.test(track.name) ? 500 : 0;
    const rangeScore = range * 2;
    const countScore = Math.min(noteCount, 3000);
    const pitchCenterScore = avgPitch >= 50 && avgPitch <= 80 ? 200 : 0;

    return {
      track,
      score: rangeScore + countScore + pitchCenterScore + nameBonus,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.track ?? null;
}

// ─── Melody/Harmony Splitting ────────────────────────────────

const ONSET_WINDOW_MS = 0.05; // 50ms window for grouping simultaneous notes
const MELODY_SPLIT_THRESHOLD = 60; // C4 — rough boundary between hands

interface NoteGroup {
  time: number;
  notes: MidiNoteEvent[];
}

function splitPianoTrack(notes: MidiNoteEvent[]): {
  melody: MidiNoteEvent[];
  harmony: MidiNoteEvent[];
} {
  if (notes.length === 0) return { melody: [], harmony: [] };

  // Group notes by onset time (50ms window)
  const groups = groupByOnset(notes);

  const melody: MidiNoteEvent[] = [];
  const harmony: MidiNoteEvent[] = [];

  for (const group of groups) {
    if (group.notes.length === 1) {
      // Single note — classify by pitch
      const note = group.notes[0]!;
      if (note.midi >= MELODY_SPLIT_THRESHOLD) {
        melody.push(note);
      } else {
        harmony.push(note);
      }
      continue;
    }

    // Multiple simultaneous notes — separate top voice from voicing
    const sorted = [...group.notes].sort((a, b) => b.midi - a.midi);
    const highest = sorted[0]!;
    const rest = sorted.slice(1);
    const span = highest.midi - sorted[sorted.length - 1]!.midi;

    if (span > 12 && highest.midi >= MELODY_SPLIT_THRESHOLD) {
      // Wide spread — top note is likely melody, rest is harmony
      melody.push(highest);
      harmony.push(...rest);
    } else if (highest.midi >= MELODY_SPLIT_THRESHOLD + 7 && rest.length >= 2) {
      // Top note is significantly above the cluster — melody
      melody.push(highest);
      harmony.push(...rest);
    } else {
      // Tight cluster — all harmony (block chord or LH voicing)
      harmony.push(...group.notes);
    }
  }

  return { melody, harmony };
}

function groupByOnset(notes: MidiNoteEvent[]): NoteGroup[] {
  if (notes.length === 0) return [];

  const sorted = [...notes].sort((a, b) => a.time - b.time);
  const groups: NoteGroup[] = [];
  let current: NoteGroup = { time: sorted[0]!.time, notes: [sorted[0]!] };

  for (let i = 1; i < sorted.length; i++) {
    const note = sorted[i]!;
    if (note.time - current.time <= ONSET_WINDOW_MS) {
      current.notes.push(note);
    } else {
      groups.push(current);
      current = { time: note.time, notes: [note] };
    }
  }
  groups.push(current);

  return groups;
}

// ─── Note Extraction ─────────────────────────────────────────

function extractNoteEvents(
  track: Midi["tracks"][number],
  header: Midi["header"],
): MidiNoteEvent[] {
  return track.notes.map((note) => ({
    midi: note.midi,
    name: note.name,
    pitch: note.pitch,
    octave: note.octave,
    time: note.time,
    duration: note.duration,
    velocity: note.velocity,
    ticks: note.ticks,
    durationTicks: note.durationTicks,
    bar: Math.floor(header.ticksToMeasures(note.ticks)),
  }));
}

// ─── Header Extraction ───────────────────────────────────────

function extractTempoEvents(header: Midi["header"]): TempoEvent[] {
  return header.tempos.map((t) => ({
    ticks: t.ticks,
    bpm: t.bpm,
    time: t.time ?? header.ticksToSeconds(t.ticks),
  }));
}

function extractTimeSignature(header: Midi["header"]): TimeSignature {
  const ts = header.timeSignatures[0];
  if (ts) {
    return {
      numerator: ts.timeSignature[0] ?? 4,
      denominator: ts.timeSignature[1] ?? 4,
    };
  }
  return { numerator: 4, denominator: 4 };
}

function extractKeySignature(header: Midi["header"]): string {
  const ks = header.keySignatures[0];
  if (ks) {
    return ks.key + (ks.scale === "minor" ? "m" : "");
  }
  return "C";
}

function extractTextEvents(header: Midi["header"]): string[] {
  return header.meta
    .filter(
      (m) => m.type === "text" || m.type === "marker" || m.type === "cuePoint",
    )
    .map((m) => m.text);
}
