import * as Tone from "tone";
import type { AudioConfig } from "./audio-config-types";
import type { NoteName } from "@/types/audio";
import type { PlaybackEngine } from "./playback";
import { DEGREE_SYNTH_OPTIONS, PIANO_FM_TIMBRE } from "./shared-synth-config";
import { noteToMidi, midiToNoteName } from "./music-theory";

// ─── Scale interval maps ────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────────

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRoot(root: string): { noteName: NoteName; octave: number } {
  const match = root.match(/^([A-Ga-g][#b]?)(\d+)?$/);
  if (!match) return { noteName: "C" as NoteName, octave: 4 };
  return {
    noteName: (match[1]!.charAt(0).toUpperCase() +
      match[1]!.slice(1)) as NoteName,
    octave: match[2] ? parseInt(match[2], 10) : 4,
  };
}

function beatsToSeconds(beats: number, tempo: number): number {
  return (beats / tempo) * 60;
}

function createSynth(filter: Tone.Filter): Tone.FMSynth {
  return new Tone.FMSynth(DEGREE_SYNTH_OPTIONS).connect(filter);
}

function createPolySynth(filter: Tone.Filter): Tone.PolySynth {
  return new Tone.PolySynth(Tone.FMSynth, DEGREE_SYNTH_OPTIONS).connect(filter);
}

function createEffectsChain(): {
  filter: Tone.Filter;
  reverb: Tone.Reverb;
  dispose: () => void;
} {
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
  return {
    filter,
    reverb,
    dispose: () => {
      filter.dispose();
      reverb.dispose();
    },
  };
}

// ─── Scale modes ────────────────────────────────────────────

async function playScaleBare(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const tempo = config.tempo ?? 120;
  const scaleType = config.scaleType ?? "major";
  const direction = config.direction ?? "both";
  const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major!;
  const rootMidi = noteToMidi(noteName, octave);

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
  const noteDuration = beatsToSeconds(1, tempo);

  const chain = createEffectsChain();
  const synth = createSynth(chain.filter);
  const now = Tone.now() + 0.05;
  const gap = noteDuration * 0.1;

  for (let i = 0; i < notes.length; i++) {
    synth.triggerAttackRelease(
      notes[i]!,
      noteDuration * 0.85,
      now + i * (noteDuration - gap),
    );
  }

  await wait(notes.length * (noteDuration - gap) * 1000 + 300);
  synth.dispose();
  chain.dispose();
}

async function playScaleWithVamp(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const tempo = config.tempo ?? 120;
  const scaleType = config.scaleType ?? "major";
  const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major!;
  const rootMidi = noteToMidi(noteName, octave);

  const chain = createEffectsChain();
  const melodySynth = createSynth(chain.filter);

  // Vamp pad — sustained chords underneath
  const vampReverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
  const vampFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
    rolloff: -24,
  }).connect(vampReverb);
  const vampSynth = new Tone.PolySynth(Tone.FMSynth, {
    ...PIANO_FM_TIMBRE,
    envelope: { attack: 0.1, decay: 0.4, sustain: 0.6, release: 1.5 },
    volume: -8,
  }).connect(vampFilter);

  // Build vamp chords (I chord sustained underneath)
  const vampChords = config.vamp?.chords ?? [`${noteName}3`];
  const vampNotes = vampChords.length > 0 ? vampChords : [`${noteName}3`];

  const now = Tone.now() + 0.05;
  const noteDuration = beatsToSeconds(1, tempo);

  // Play ascending + descending
  const desc = [...intervals].slice(0, -1).reverse();
  const semitones = [...intervals, ...desc];
  const totalDuration = semitones.length * noteDuration;

  // Start vamp chord
  vampSynth.triggerAttackRelease(vampNotes, totalDuration + 0.5, now);

  // Play scale melody over vamp
  const gap = noteDuration * 0.1;
  for (let i = 0; i < semitones.length; i++) {
    const note = midiToNoteName(rootMidi + semitones[i]!);
    melodySynth.triggerAttackRelease(
      note,
      noteDuration * 0.85,
      now + i * (noteDuration - gap),
    );
  }

  await wait(totalDuration * 1000 + 500);
  melodySynth.dispose();
  vampSynth.dispose();
  vampFilter.dispose();
  vampReverb.dispose();
  chain.dispose();
}

// ─── Interval modes ─────────────────────────────────────────

async function playIntervalMelodic(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervalSemitones = config.intervals?.[0] ?? 7;
  const duration = 0.8;
  const gap = 0.3;

  const chain = createEffectsChain();
  const synth = createSynth(chain.filter);
  const now = Tone.now() + 0.05;

  const bottomNote = midiToNoteName(rootMidi);
  const topNote = midiToNoteName(rootMidi + intervalSemitones);

  synth.triggerAttackRelease(bottomNote, duration, now);
  synth.triggerAttackRelease(topNote, duration, now + duration + gap);

  await wait((duration * 2 + gap) * 1000 + 200);
  synth.dispose();
  chain.dispose();
}

async function playIntervalHarmonic(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervalSemitones = config.intervals?.[0] ?? 7;
  const duration = 1.5;

  const chain = createEffectsChain();
  const poly = createPolySynth(chain.filter);
  const now = Tone.now() + 0.05;

  const bottomNote = midiToNoteName(rootMidi);
  const topNote = midiToNoteName(rootMidi + intervalSemitones);

  poly.triggerAttackRelease([bottomNote, topNote], duration, now);

  await wait(duration * 1000 + 200);
  poly.dispose();
  chain.dispose();
}

async function playIntervalComparison(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ?? [4, 7]; // two intervals to compare
  const duration = 0.8;
  const noteGap = 0.3;
  const pairGap = 0.8;

  const chain = createEffectsChain();
  const synth = createSynth(chain.filter);
  const now = Tone.now() + 0.05;

  let offset = 0;
  for (let p = 0; p < Math.min(intervals.length, 2); p++) {
    const bottomNote = midiToNoteName(rootMidi);
    const topNote = midiToNoteName(rootMidi + intervals[p]!);
    synth.triggerAttackRelease(bottomNote, duration, now + offset);
    synth.triggerAttackRelease(
      topNote,
      duration,
      now + offset + duration + noteGap,
    );
    offset += duration * 2 + noteGap + pairGap;
  }

  await wait(offset * 1000 + 200);
  synth.dispose();
  chain.dispose();
}

// ─── Chord modes ────────────────────────────────────────────

async function playChordArpeggiated(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ?? [0, 4, 7]; // default major triad
  const arpGap = 0.1;
  const sustainDuration = 1.5;

  const chain = createEffectsChain();
  const synth = createSynth(chain.filter);
  const poly = createPolySynth(chain.filter);
  const now = Tone.now() + 0.05;

  const notes = intervals.map((s) => midiToNoteName(rootMidi + s));

  // Arpeggiate bottom to top
  for (let i = 0; i < notes.length; i++) {
    synth.triggerAttackRelease(notes[i]!, 0.3, now + i * arpGap);
  }

  // Then sustain as block chord
  const blockStart = now + notes.length * arpGap + 0.15;
  poly.triggerAttackRelease(notes, sustainDuration, blockStart);

  await wait((notes.length * arpGap + 0.15 + sustainDuration) * 1000 + 200);
  synth.dispose();
  poly.dispose();
  chain.dispose();
}

async function playChordBlocked(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ?? [0, 4, 7];
  const duration = 1.5;

  const chain = createEffectsChain();
  const poly = createPolySynth(chain.filter);
  const now = Tone.now() + 0.05;

  const notes = intervals.map((s) => midiToNoteName(rootMidi + s));
  poly.triggerAttackRelease(notes, duration, now);

  await wait(duration * 1000 + 200);
  poly.dispose();
  chain.dispose();
}

// ─── Degree modes ───────────────────────────────────────────

async function playDegreeWithDrone(config: AudioConfig): Promise<void> {
  const dronePitch = config.drone?.pitch ?? config.root ?? "C3";
  const { noteName: droneNote, octave: droneOctave } = parseRoot(dronePitch);

  const chain = createEffectsChain();

  // Drone — sustained pad
  const droneReverb = new Tone.Reverb({ decay: 3, wet: 0.25 }).toDestination();
  const droneFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    rolloff: -24,
  }).connect(droneReverb);
  const droneOsc = new Tone.Oscillator({
    type: "sine",
    frequency: Tone.Frequency(`${droneNote}${droneOctave}`).toFrequency(),
  }).connect(droneFilter);
  const droneGain = new Tone.Gain(0.2).connect(droneFilter);
  droneOsc.disconnect();
  droneOsc.connect(droneGain);

  // Target degree note
  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";

  const melodySynth = createSynth(chain.filter);

  const now = Tone.now() + 0.05;
  droneOsc.start(now);

  // Play target note after 1.5s of drone
  const targetDelay = 1.5;
  melodySynth.triggerAttackRelease(targetPitch, 1.5, now + targetDelay);

  await wait((targetDelay + 1.5) * 1000 + 500);

  droneOsc.stop();
  droneOsc.dispose();
  droneGain.dispose();
  droneFilter.dispose();
  droneReverb.dispose();
  melodySynth.dispose();
  chain.dispose();
}

async function playDegreeWithVamp(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C3");
  const tempo = config.tempo ?? 100;

  const chain = createEffectsChain();

  // Vamp — I-IV-V-I cadence
  const vampReverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 }).toDestination();
  const vampFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 1200,
    rolloff: -12,
  }).connect(vampReverb);
  const vampSynth = new Tone.PolySynth(Tone.FMSynth, {
    ...PIANO_FM_TIMBRE,
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.15, release: 0.4 },
    volume: -3,
  }).connect(vampFilter);

  const rootMidi = noteToMidi(noteName, octave < 4 ? octave : 3);
  // I-IV-V-I
  const cadenceChords = [
    [0, 4, 7],
    [5, 9, 12],
    [7, 11, 14],
    [0, 4, 7],
  ].map((intervals) => intervals.map((s) => midiToNoteName(rootMidi + s)));

  const chordDuration = beatsToSeconds(1, tempo);
  const now = Tone.now() + 0.05;

  for (let i = 0; i < cadenceChords.length; i++) {
    vampSynth.triggerAttackRelease(
      cadenceChords[i]!,
      chordDuration * 0.9,
      now + i * chordDuration,
    );
  }

  // Play target degree note after vamp
  const vampTotal = cadenceChords.length * chordDuration;
  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";

  const melodySynth = createSynth(chain.filter);
  melodySynth.triggerAttackRelease(targetPitch, 1.5, now + vampTotal + 0.2);

  await wait((vampTotal + 0.2 + 1.5) * 1000 + 300);

  vampSynth.dispose();
  vampFilter.dispose();
  vampReverb.dispose();
  melodySynth.dispose();
  chain.dispose();
}

async function playDegreeFadingDrone(config: AudioConfig): Promise<void> {
  const dronePitch = config.drone?.pitch ?? config.root ?? "C3";
  const { noteName: droneNote, octave: droneOctave } = parseRoot(dronePitch);
  const fadeAfterBars = config.drone?.fadeAfterBars ?? 2;
  const tempo = config.tempo ?? 100;

  const chain = createEffectsChain();

  // Drone with fade envelope
  const droneReverb = new Tone.Reverb({ decay: 3, wet: 0.25 }).toDestination();
  const droneFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    rolloff: -24,
  }).connect(droneReverb);
  const droneGain = new Tone.Gain(0.25).connect(droneFilter);
  const droneOsc = new Tone.Oscillator({
    type: "sine",
    frequency: Tone.Frequency(`${droneNote}${droneOctave}`).toFrequency(),
  }).connect(droneGain);

  const now = Tone.now() + 0.05;
  const barDuration = beatsToSeconds(4, tempo);
  const droneDuration = barDuration * fadeAfterBars;
  const fadeDuration = barDuration * 2;

  droneOsc.start(now);
  // Fade out drone over 2 bars
  droneGain.gain.setValueAtTime(0.25, now + droneDuration);
  droneGain.gain.linearRampToValueAtTime(0, now + droneDuration + fadeDuration);

  // Play target note after drone has fully faded
  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";
  const silenceGap = 0.5;
  const targetStart = droneDuration + fadeDuration + silenceGap;

  const melodySynth = createSynth(chain.filter);
  melodySynth.triggerAttackRelease(targetPitch, 1.5, now + targetStart);

  await wait((targetStart + 1.5) * 1000 + 500);

  droneOsc.stop();
  droneOsc.dispose();
  droneGain.dispose();
  droneFilter.dispose();
  droneReverb.dispose();
  melodySynth.dispose();
  chain.dispose();
}

// ─── Ensemble/Excerpt modes ─────────────────────────────────

async function playMelodyExcerpt(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 100;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  const chain = createEffectsChain();
  const synth = createSynth(chain.filter);
  const now = Tone.now() + 0.05;

  let maxEnd = 0;
  for (const note of notes) {
    const startSec = beatsToSeconds(note.start, tempo);
    const durSec = beatsToSeconds(note.duration, tempo);
    synth.triggerAttackRelease(note.pitch, durSec * 0.9, now + startSec);
    maxEnd = Math.max(maxEnd, startSec + durSec);
  }

  await wait(maxEnd * 1000 + 300);
  synth.dispose();
  chain.dispose();
}

async function playChoraleSatb(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 72;
  const voices = config.voices ?? {};
  const voiceNames = ["soprano", "alto", "tenor", "bass"];

  const chain = createEffectsChain();
  const synths: Tone.FMSynth[] = [];

  let maxEnd = 0;
  const now = Tone.now() + 0.05;

  for (const voiceName of voiceNames) {
    const voiceNotes = voices[voiceName];
    if (!voiceNotes || voiceNotes.length === 0) continue;

    const synth = createSynth(chain.filter);
    // Slightly different volume per voice for natural blend
    if (voiceName === "bass") synth.volume.value = 2;
    else if (voiceName === "soprano") synth.volume.value = 1;
    else synth.volume.value = -1;

    synths.push(synth);

    for (const note of voiceNotes) {
      const startSec = beatsToSeconds(note.start, tempo);
      const durSec = beatsToSeconds(note.duration, tempo);
      synth.triggerAttackRelease(note.pitch, durSec * 0.9, now + startSec);
      maxEnd = Math.max(maxEnd, startSec + durSec);
    }
  }

  await wait(maxEnd * 1000 + 500);
  for (const s of synths) s.dispose();
  chain.dispose();
}

async function playProgressionBlock(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 100;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  const chain = createEffectsChain();
  const poly = createPolySynth(chain.filter);
  const now = Tone.now() + 0.05;

  let maxEnd = 0;

  for (const note of notes) {
    const startSec = beatsToSeconds(note.start, tempo);
    const durSec = beatsToSeconds(note.duration, tempo);
    // Pitch can be comma-separated for chords: "C3,E3,G3"
    const pitches = note.pitch.includes(",")
      ? note.pitch.split(",").map((p) => p.trim())
      : [note.pitch];
    poly.triggerAttackRelease(pitches, durSec * 0.9, now + startSec);
    maxEnd = Math.max(maxEnd, startSec + durSec);
  }

  await wait(maxEnd * 1000 + 300);
  poly.dispose();
  chain.dispose();
}

async function playRhythmPercussion(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 120;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  // Percussive click using MetalSynth
  const reverb = new Tone.Reverb({ decay: 0.5, wet: 0.08 }).toDestination();
  const metalSynth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 2000,
    octaves: 0.5,
    volume: -6,
  }).connect(reverb);

  const now = Tone.now() + 0.05;
  let maxEnd = 0;

  for (const note of notes) {
    const startSec = beatsToSeconds(note.start, tempo);
    const durSec = beatsToSeconds(note.duration, tempo);
    metalSynth.triggerAttackRelease(durSec, now + startSec);
    maxEnd = Math.max(maxEnd, startSec + durSec);
  }

  await wait(maxEnd * 1000 + 300);
  metalSynth.dispose();
  reverb.dispose();
}

// ─── Main Router ────────────────────────────────────────────

export async function playAudioConfig(
  _engine: PlaybackEngine,
  config: AudioConfig,
): Promise<void> {
  await Tone.start();

  switch (config.mode) {
    case "scale_bare":
      return playScaleBare(config);
    case "scale_with_vamp":
      return playScaleWithVamp(config);
    case "interval_melodic":
      return playIntervalMelodic(config);
    case "interval_harmonic":
      return playIntervalHarmonic(config);
    case "interval_comparison":
      return playIntervalComparison(config);
    case "chord_arpeggiated":
      return playChordArpeggiated(config);
    case "chord_blocked":
      return playChordBlocked(config);
    case "degree_with_drone":
      return playDegreeWithDrone(config);
    case "degree_with_vamp":
      return playDegreeWithVamp(config);
    case "degree_fading_drone":
      return playDegreeFadingDrone(config);
    case "melody_excerpt":
      return playMelodyExcerpt(config);
    case "chorale_satb":
      return playChoraleSatb(config);
    case "progression_block":
      return playProgressionBlock(config);
    case "rhythm_percussion":
      return playRhythmPercussion(config);
    default: {
      const _exhaustive: never = config.mode;
      throw new Error(`Unknown audio mode: ${config.mode}`);
    }
  }
}
