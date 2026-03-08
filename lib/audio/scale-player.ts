import * as Tone from "tone";
import { DEGREE_SYNTH_OPTIONS } from "./shared-synth-config";
import { noteToMidi, midiToNoteName, stripOctave } from "./music-theory";
import type { NoteName } from "@/types/audio";

// Semitone intervals from root for each scale type (ascending, 8 notes including octave)
const SCALE_INTERVALS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  mixolydian: [0, 2, 4, 5, 7, 9, 10, 12],
  aeolian: [0, 2, 3, 5, 7, 8, 10, 12],
  locrian: [0, 1, 3, 5, 6, 8, 10, 12],
  natural_minor: [0, 2, 3, 5, 7, 8, 10, 12],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11, 12],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11, 12],
};

export interface ScalePlaybackConfig {
  root: string;
  scaleType: string;
  direction?: "ascending" | "descending" | "both";
  tempo?: number; // notes per second, default 3
}

export async function playScale(config: ScalePlaybackConfig): Promise<void> {
  const { root, scaleType, direction = "ascending", tempo = 3 } = config;

  const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major!;

  // Parse root note and octave (e.g. "A3" → "A", 3)
  const octaveMatch = root.match(/(\d+)$/);
  const octave = octaveMatch ? parseInt(octaveMatch[1]!, 10) : 4;
  const noteName = stripOctave(root) as NoteName;
  const rootMidi = noteToMidi(noteName, octave);

  // Build note sequence based on direction
  let semitones: number[];
  if (direction === "descending") {
    semitones = [...intervals].reverse();
  } else if (direction === "both") {
    const desc = [...intervals].slice(0, -1).reverse();
    semitones = [...intervals, ...desc];
  } else {
    semitones = [...intervals];
  }

  const notes = semitones.map((s) => midiToNoteName(rootMidi + s));
  const noteDuration = 1 / tempo;

  // Create a temporary synth for playback
  const reverb = new Tone.Reverb({
    decay: 1.5,
    wet: 0.12,
    preDelay: 0.01,
  }).toDestination();

  const filter = new Tone.Filter({
    type: "lowpass",
    frequency: 2000,
    rolloff: -12,
    Q: 0.5,
  }).connect(reverb);

  const synth = new Tone.FMSynth(DEGREE_SYNTH_OPTIONS).connect(filter);

  const now = Tone.now() + 0.05;
  const gap = noteDuration * 0.1;

  for (let i = 0; i < notes.length; i++) {
    synth.triggerAttackRelease(
      notes[i]!,
      noteDuration * 0.85,
      now + i * (noteDuration - gap),
    );
  }

  const totalMs = notes.length * (noteDuration - gap) * 1000 + 300;

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      synth.dispose();
      filter.dispose();
      reverb.dispose();
      resolve();
    }, totalMs);
  });
}
