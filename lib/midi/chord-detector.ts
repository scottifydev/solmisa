import type {
  MidiNoteEvent,
  ParsedStandard,
  AnalyzedChord,
  DetectedChord,
  HarmonicFunction,
  ChordQualityExtended,
  VoicingType,
} from "@/types/standards-lab";
import {
  VOICING_TEMPLATES,
  QUALITY_SYMBOLS,
  CHORD_TONES,
  AVAILABLE_TENSIONS,
  AVOID_NOTES,
  pitchClassName,
} from "./voicing-templates";

const ONSET_WINDOW = 0.05; // 50ms for grouping simultaneous notes

// ─── Main Entry ──────────────────────────────────────────────

export function detectChords(
  harmony: MidiNoteEvent[],
  parsed: ParsedStandard,
): AnalyzedChord[] {
  if (harmony.length === 0) return [];

  // Step 0: Check for text-event chord symbols
  // (TODO: parse embedded chord text from [M] files)

  // Step 1: Group simultaneous harmony notes
  const clusters = groupByOnset(harmony);

  // Step 2: Match each cluster against voicing templates
  const raw = clusters.map((cluster) => matchChordCluster(cluster, parsed));

  // Step 3: Fill durations (each chord lasts until the next one)
  fillDurations(raw, parsed.durationSeconds);

  // Step 4: Deduplicate — merge consecutive identical chords
  const deduped = deduplicateChords(raw);

  // Step 5: Functional analysis
  const keyCenter = detectKeyCenter(deduped);
  const analyzed = deduped.map((chord) => {
    const fn = assignFunction(chord, keyCenter);
    const rootPc = ((chord.rootMidi % 12) + 12) % 12;
    return {
      ...chord,
      function: fn,
      compatibleScales: getCompatibleScales(chord.quality, fn),
      chordTones:
        CHORD_TONES[chord.quality]?.map((i) => (rootPc + i) % 12) ?? [],
      tensions:
        AVAILABLE_TENSIONS[chord.quality]?.map((i) => (rootPc + i) % 12) ?? [],
      avoidNotes:
        AVOID_NOTES[chord.quality]?.map((i) => (rootPc + i) % 12) ?? [],
    };
  });

  return analyzed;
}

// ─── Onset Grouping ──────────────────────────────────────────

interface NoteCluster {
  time: number;
  notes: MidiNoteEvent[];
  bar: number;
  beat: number;
}

function groupByOnset(notes: MidiNoteEvent[]): NoteCluster[] {
  const sorted = [...notes].sort((a, b) => a.time - b.time);
  const clusters: NoteCluster[] = [];
  let cur: NoteCluster = {
    time: sorted[0]!.time,
    notes: [sorted[0]!],
    bar: sorted[0]!.bar,
    beat: 1,
  };

  for (let i = 1; i < sorted.length; i++) {
    const note = sorted[i]!;
    if (note.time - cur.time <= ONSET_WINDOW) {
      cur.notes.push(note);
    } else {
      clusters.push(cur);
      cur = { time: note.time, notes: [note], bar: note.bar, beat: 1 };
    }
  }
  clusters.push(cur);

  return clusters;
}

// ─── Template Matching ───────────────────────────────────────

function matchChordCluster(
  cluster: NoteCluster,
  parsed: ParsedStandard,
): DetectedChord {
  const midis = cluster.notes.map((n) => n.midi);
  const pitchClasses = [...new Set(midis.map((m) => m % 12))].sort(
    (a, b) => a - b,
  );

  if (pitchClasses.length < 2) {
    // Single pitch class — assume root
    const pc = pitchClasses[0] ?? 0;
    return makeChord(pc, "maj", "unknown", midis, cluster, 0.3, "detected");
  }

  let bestMatch: {
    root: number;
    quality: ChordQualityExtended;
    voicingType: VoicingType;
    score: number;
  } | null = null;

  // Try every pitch class as potential root
  for (let root = 0; root < 12; root++) {
    // Compute intervals from this root
    const intervals = pitchClasses.map((pc) => (pc - root + 12) % 12);

    for (const template of VOICING_TEMPLATES) {
      const score = scoreMatch(intervals, template.intervals, root, midis);
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          root,
          quality: template.quality,
          voicingType: template.type,
          score,
        };
      }
    }
  }

  if (bestMatch) {
    return makeChord(
      bestMatch.root,
      bestMatch.quality,
      bestMatch.voicingType,
      midis,
      cluster,
      Math.min(bestMatch.score / 10, 1),
      "detected",
    );
  }

  // Fallback: use lowest note as root, classify as unknown
  const lowestPc = midis.reduce((a, b) => (a < b ? a : b)) % 12;
  return makeChord(lowestPc, "maj", "unknown", midis, cluster, 0.1, "detected");
}

function scoreMatch(
  noteIntervals: number[],
  templateIntervals: number[],
  root: number,
  midis: number[],
): number {
  // Normalize template intervals to pitch classes (mod 12)
  const templatePCs = new Set(templateIntervals.map((i) => i % 12));
  const notePCs = new Set(noteIntervals);

  // Count matches
  let matches = 0;
  for (const pc of notePCs) {
    if (templatePCs.has(pc)) matches++;
  }

  // No match if fewer than half the notes match
  if (matches < Math.ceil(notePCs.size * 0.5)) return 0;

  // Score components
  let score = matches * 2;

  // Bonus: bass note is the root
  const lowestMidi = Math.min(...midis);
  if (lowestMidi % 12 === root) score += 2;

  // Bonus: all template tones present in notes (complete voicing)
  let templatePresent = 0;
  for (const tpc of templatePCs) {
    if (notePCs.has(tpc)) templatePresent++;
  }
  score += (templatePresent / templatePCs.size) * 2;

  // Bonus: 7th chords preferred over triads (jazz context)
  if (templateIntervals.length >= 4) score += 1;

  // Penalty: extra notes not in template
  const extraNotes = notePCs.size - matches;
  score -= extraNotes * 0.5;

  return score;
}

function makeChord(
  rootPc: number,
  quality: ChordQualityExtended,
  voicingType: VoicingType,
  midis: number[],
  cluster: NoteCluster,
  confidence: number,
  source: "detected" | "text-event",
): DetectedChord {
  const rootName = pitchClassName(rootPc);
  const suffix = QUALITY_SYMBOLS[quality] ?? "";
  const bass = pitchClassName(Math.min(...midis) % 12);

  return {
    symbol: `${rootName}${suffix}`,
    root: rootName,
    rootMidi: rootPc,
    quality,
    bass,
    notes: midis,
    time: cluster.time,
    duration: 0, // filled later
    bar: cluster.bar,
    beat: cluster.beat,
    confidence,
    voicingType,
    source,
  };
}

// ─── Duration Fill ───────────────────────────────────────────

function fillDurations(chords: DetectedChord[], totalDuration: number) {
  for (let i = 0; i < chords.length; i++) {
    const next = chords[i + 1];
    chords[i]!.duration = next
      ? next.time - chords[i]!.time
      : totalDuration - chords[i]!.time;
  }
}

// ─── Deduplication ───────────────────────────────────────────

function deduplicateChords(chords: DetectedChord[]): DetectedChord[] {
  if (chords.length === 0) return [];

  const result: DetectedChord[] = [chords[0]!];

  for (let i = 1; i < chords.length; i++) {
    const prev = result[result.length - 1]!;
    const curr = chords[i]!;

    if (prev.symbol === curr.symbol && curr.time - prev.time < 0.5) {
      // Same chord within 500ms — extend the previous
      prev.duration = curr.time + curr.duration - prev.time;
    } else {
      result.push(curr);
    }
  }

  return result;
}

// ─── Key Center Detection ────────────────────────────────────

function detectKeyCenter(chords: DetectedChord[]): string {
  if (chords.length === 0) return "C";

  // Count root frequency weighted by duration
  const rootWeights = new Map<number, number>();
  for (const chord of chords) {
    const pc = chord.rootMidi % 12;
    rootWeights.set(pc, (rootWeights.get(pc) ?? 0) + chord.duration);
  }

  // Look for dominant-tonic patterns (V-I)
  const iiVI = findIIVI(chords);
  if (iiVI) return iiVI;

  // Fallback: most frequent root
  let bestPc = 0;
  let bestWeight = 0;
  for (const [pc, weight] of rootWeights) {
    if (weight > bestWeight) {
      bestPc = pc;
      bestWeight = weight;
    }
  }

  return pitchClassName(bestPc);
}

function findIIVI(chords: DetectedChord[]): string | null {
  // Look for the most common ii-V-I pattern
  const candidates = new Map<number, number>(); // key center pc -> count

  for (let i = 0; i < chords.length - 2; i++) {
    const a = chords[i]!;
    const b = chords[i + 1]!;
    const c = chords[i + 2]!;

    // Check if a=ii (min7), b=V (dom7), c=I (maj7)
    const isMinor7 = ["min7", "min9", "min11"].includes(a.quality);
    const isDom7 = ["dom7", "dom9", "dom13"].includes(b.quality);
    const isMaj = ["maj7", "maj9", "maj", "6"].includes(c.quality);

    if (isMinor7 && isDom7 && isMaj) {
      // V root should be 5 semitones above ii root
      const iiRoot = a.rootMidi % 12;
      const vRoot = b.rootMidi % 12;
      const iRoot = c.rootMidi % 12;

      if ((vRoot - iiRoot + 12) % 12 === 5 && (iRoot - vRoot + 12) % 12 === 7) {
        // Valid ii-V-I — the I root is the key center
        candidates.set(iRoot, (candidates.get(iRoot) ?? 0) + 1);
      }
    }
  }

  if (candidates.size === 0) return null;

  let bestPc = 0;
  let bestCount = 0;
  for (const [pc, count] of candidates) {
    if (count > bestCount) {
      bestPc = pc;
      bestCount = count;
    }
  }

  return pitchClassName(bestPc);
}

// ─── Functional Assignment ───────────────────────────────────

const DEGREE_NAMES: Record<number, string> = {
  0: "I",
  1: "bII",
  2: "II",
  3: "bIII",
  4: "III",
  5: "IV",
  6: "bV",
  7: "V",
  8: "bVI",
  9: "VI",
  10: "bVII",
  11: "VII",
};

function assignFunction(
  chord: DetectedChord,
  keyCenter: string,
): HarmonicFunction {
  const keyPc = pitchClassFromName(keyCenter);
  const chordPc = chord.rootMidi % 12;
  const degree = (chordPc - keyPc + 12) % 12;

  const romanBase = DEGREE_NAMES[degree] ?? "?";
  const isMinorQuality = [
    "min",
    "min7",
    "min9",
    "min11",
    "min6",
    "dim",
    "dim7",
    "min7b5",
  ].includes(chord.quality);

  const roman = isMinorQuality ? romanBase.toLowerCase() : romanBase;

  let functionType: HarmonicFunction["functionType"] = "modal";
  if (degree === 0 || degree === 4 || degree === 9) functionType = "tonic";
  else if (degree === 5 || degree === 2) functionType = "subdominant";
  else if (degree === 7 || degree === 11) functionType = "dominant";

  return {
    romanNumeral: roman,
    degree: degree === 0 ? 1 : Math.ceil((degree / 12) * 7) + 1,
    functionType,
    isSecondary: false,
    keyCenter,
  };
}

function pitchClassFromName(name: string): number {
  const map: Record<string, number> = {
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
  return map[name.replace("m", "")] ?? 0;
}

// ─── Scale Compatibility ─────────────────────────────────────

function getCompatibleScales(
  quality: ChordQualityExtended,
  fn: HarmonicFunction,
): string[] {
  const scales: Record<string, string[]> = {
    maj7: ["Ionian", "Lydian"],
    maj9: ["Ionian", "Lydian"],
    "6": ["Ionian", "Lydian"],
    dom7: ["Mixolydian", "Lydian Dominant", "Altered"],
    dom9: ["Mixolydian", "Lydian Dominant"],
    dom13: ["Mixolydian"],
    sus4: ["Mixolydian"],
    sus2: ["Mixolydian"],
    min7: ["Dorian", "Aeolian", "Phrygian"],
    min9: ["Dorian", "Aeolian"],
    min11: ["Dorian", "Aeolian"],
    min6: ["Dorian", "Melodic Minor"],
    min7b5: ["Locrian", "Locrian #2"],
    dim7: ["Whole-Half Diminished"],
    maj: ["Ionian", "Lydian"],
    min: ["Dorian", "Aeolian"],
    dim: ["Whole-Half Diminished"],
    aug: ["Whole Tone"],
  };

  // Refine based on function
  const base = scales[quality] ?? ["Chromatic"];

  if (fn.functionType === "dominant" && quality === "dom7") {
    return [
      "Mixolydian",
      "Altered",
      "Half-Whole Diminished",
      "Lydian Dominant",
    ];
  }
  if (fn.functionType === "subdominant" && quality === "min7") {
    return ["Dorian"];
  }

  return base;
}

// ─── Bar-Level Chord Quantization (SCO-474) ──────────────────

/**
 * Reduce chords to max one (or two) per bar.
 * Picks the longest-duration chord in each bar as the structural chord.
 * If a second chord occupies >= 40% of the bar, it's kept too.
 */
export function quantizeChordsToBar(
  chords: AnalyzedChord[],
  totalBars: number,
): AnalyzedChord[] {
  if (chords.length === 0) return [];

  const result: AnalyzedChord[] = [];

  for (let bar = 0; bar < totalBars; bar++) {
    const barChords = chords.filter((c) => c.bar === bar);
    if (barChords.length === 0) continue;

    // Sort by duration descending
    const sorted = [...barChords].sort((a, b) => b.duration - a.duration);
    const totalDur = sorted.reduce((s, c) => s + c.duration, 0);

    // Always keep the longest
    result.push(sorted[0]!);

    // Keep a second chord if it fills >= 40% of the bar and is different
    if (sorted.length > 1 && sorted[1]!.duration / totalDur >= 0.4) {
      if (sorted[1]!.symbol !== sorted[0]!.symbol) {
        result.push(sorted[1]!);
      }
    }
  }

  // Sort by time
  result.sort((a, b) => a.time - b.time);
  return result;
}
