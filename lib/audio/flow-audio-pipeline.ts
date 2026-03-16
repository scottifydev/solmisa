import * as Tone from "tone";
import type { AudioConfig } from "./audio-config-types";
import type { NoteName } from "@/types/audio";
import type { PlaybackEngine } from "./playback";
import { noteToMidi, midiToNoteName } from "./music-theory";
import { CHORD_INTERVALS } from "./playback";
import type { ChordQuality } from "@/types/audio";
import { ensureAudio } from "./solmisa-piano";

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

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;
  const gap = noteDuration * 0.1;

  for (let i = 0; i < notes.length; i++) {
    s.triggerAttackRelease(
      notes[i]!,
      noteDuration * 0.85,
      now + i * (noteDuration - gap),
    );
  }

  await wait(notes.length * (noteDuration - gap) * 1000 + 300);
}

async function playScaleWithVamp(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const tempo = config.tempo ?? 120;
  const scaleType = config.scaleType ?? "major";
  const intervals = SCALE_INTERVALS[scaleType] ?? SCALE_INTERVALS.major!;
  const rootMidi = noteToMidi(noteName, octave);

  const s = await ensureAudio();

  // Vamp notes
  const vampChords = config.vamp?.chords ?? [`${noteName}3`];
  const vampNotes = vampChords.length > 0 ? vampChords : [`${noteName}3`];

  const now = Tone.now() + 0.05;
  const noteDuration = beatsToSeconds(1, tempo);

  const desc = [...intervals].slice(0, -1).reverse();
  const semitones = [...intervals, ...desc];
  const totalDuration = semitones.length * noteDuration;

  // Start vamp chord
  s.triggerAttackRelease(vampNotes, totalDuration + 0.5, now, 0.4);

  // Play scale melody over vamp
  const gap = noteDuration * 0.1;
  for (let i = 0; i < semitones.length; i++) {
    const note = midiToNoteName(rootMidi + semitones[i]!);
    s.triggerAttackRelease(
      note,
      noteDuration * 0.85,
      now + i * (noteDuration - gap),
    );
  }

  await wait(totalDuration * 1000 + 500);
}

// ─── Interval modes ─────────────────────────────────────────

async function playIntervalMelodic(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervalSemitones = config.intervals?.[0] ?? 7;
  const duration = 0.8;
  const gap = 0.3;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  const bottomNote = midiToNoteName(rootMidi);
  const topNote = midiToNoteName(rootMidi + intervalSemitones);

  s.triggerAttackRelease(bottomNote, duration, now);
  s.triggerAttackRelease(topNote, duration, now + duration + gap);

  await wait((duration * 2 + gap) * 1000 + 200);
}

async function playIntervalHarmonic(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervalSemitones = config.intervals?.[0] ?? 7;
  const duration = 1.5;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  const bottomNote = midiToNoteName(rootMidi);
  const topNote = midiToNoteName(rootMidi + intervalSemitones);

  s.triggerAttackRelease([bottomNote, topNote], duration, now);

  await wait(duration * 1000 + 200);
}

async function playIntervalComparison(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ?? [4, 7];
  const duration = 0.8;
  const noteGap = 0.3;
  const pairGap = 0.8;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  let offset = 0;
  for (let p = 0; p < Math.min(intervals.length, 2); p++) {
    const bottomNote = midiToNoteName(rootMidi);
    const topNote = midiToNoteName(rootMidi + intervals[p]!);
    s.triggerAttackRelease(bottomNote, duration, now + offset);
    s.triggerAttackRelease(
      topNote,
      duration,
      now + offset + duration + noteGap,
    );
    offset += duration * 2 + noteGap + pairGap;
  }

  await wait(offset * 1000 + 200);
}

// ─── Chord modes ────────────────────────────────────────────

async function playChordArpeggiated(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ??
    CHORD_INTERVALS[
      (config as unknown as Record<string, unknown>).quality as ChordQuality
    ] ?? [0, 4, 7];
  const arpGap = 0.1;
  const sustainDuration = 1.5;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  const notes = intervals.map((i) => midiToNoteName(rootMidi + i));

  // Arpeggiate bottom to top
  for (let i = 0; i < notes.length; i++) {
    s.triggerAttackRelease(notes[i]!, 0.3, now + i * arpGap);
  }

  // Then sustain as block chord
  const blockStart = now + notes.length * arpGap + 0.15;
  s.triggerAttackRelease(notes, sustainDuration, blockStart);

  await wait((notes.length * arpGap + 0.15 + sustainDuration) * 1000 + 200);
}

async function playChordBlocked(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C4");
  const rootMidi = noteToMidi(noteName, octave);
  const intervals = config.intervals ??
    CHORD_INTERVALS[
      (config as unknown as Record<string, unknown>).quality as ChordQuality
    ] ?? [0, 4, 7];
  const duration = 1.5;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  const notes = intervals.map((i) => midiToNoteName(rootMidi + i));
  s.triggerAttackRelease(notes, duration, now);

  await wait(duration * 1000 + 200);
}

// ─── Degree modes ───────────────────────────────────────────

async function playDegreeWithDrone(config: AudioConfig): Promise<void> {
  const dronePitch = config.drone?.pitch ?? config.root ?? "C3";
  const { noteName: droneNote, octave: droneOctave } = parseRoot(dronePitch);

  const droneReverb = new Tone.Reverb({ decay: 3, wet: 0.25 }).toDestination();
  await droneReverb.ready;
  const droneFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 600,
    rolloff: -24,
  }).connect(droneReverb);
  const droneGain = new Tone.Gain(0.2).connect(droneFilter);
  const droneOsc = new Tone.Oscillator({
    type: "sine",
    frequency: Tone.Frequency(`${droneNote}${droneOctave}`).toFrequency(),
  }).connect(droneGain);

  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;
  droneOsc.start(now);

  const targetDelay = 1.5;
  s.triggerAttackRelease(targetPitch, 1.5, now + targetDelay);

  await wait((targetDelay + 1.5) * 1000 + 500);

  droneOsc.stop();
  droneOsc.dispose();
  droneGain.dispose();
  droneFilter.dispose();
  droneReverb.dispose();
}

async function playDegreeWithVamp(config: AudioConfig): Promise<void> {
  const { noteName, octave } = parseRoot(config.root ?? "C3");
  const tempo = config.tempo ?? 100;

  const s = await ensureAudio();

  const rootMidi = noteToMidi(noteName, octave < 4 ? octave : 3);
  const cadenceChords = [
    [0, 4, 7],
    [5, 9, 12],
    [7, 11, 14],
    [0, 4, 7],
  ].map((intervals) => intervals.map((i) => midiToNoteName(rootMidi + i)));

  const chordDuration = beatsToSeconds(1, tempo);
  const now = Tone.now() + 0.05;

  for (let i = 0; i < cadenceChords.length; i++) {
    s.triggerAttackRelease(
      cadenceChords[i]!,
      chordDuration * 0.9,
      now + i * chordDuration,
      0.5,
    );
  }

  const vampTotal = cadenceChords.length * chordDuration;
  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";

  s.triggerAttackRelease(targetPitch, 1.5, now + vampTotal + 0.2);

  await wait((vampTotal + 0.2 + 1.5) * 1000 + 300);
}

async function playDegreeFadingDrone(config: AudioConfig): Promise<void> {
  const dronePitch = config.drone?.pitch ?? config.root ?? "C3";
  const { noteName: droneNote, octave: droneOctave } = parseRoot(dronePitch);
  const fadeAfterBars = config.drone?.fadeAfterBars ?? 2;
  const tempo = config.tempo ?? 100;

  const droneReverb = new Tone.Reverb({ decay: 3, wet: 0.25 }).toDestination();
  await droneReverb.ready;
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
  droneGain.gain.setValueAtTime(0.25, now + droneDuration);
  droneGain.gain.linearRampToValueAtTime(0, now + droneDuration + fadeDuration);

  const targetNotes = config.notes ?? [];
  const targetPitch = targetNotes[0]?.pitch ?? config.root ?? "C4";
  const silenceGap = 0.5;
  const targetStart = droneDuration + fadeDuration + silenceGap;

  const s = await ensureAudio();
  s.triggerAttackRelease(targetPitch, 1.5, now + targetStart);

  await wait((targetStart + 1.5) * 1000 + 500);

  droneOsc.stop();
  droneOsc.dispose();
  droneGain.dispose();
  droneFilter.dispose();
  droneReverb.dispose();
}

// ─── Ensemble/Excerpt modes ─────────────────────────────────

async function playMelodyExcerpt(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 100;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  let maxEnd = 0;
  for (const note of notes) {
    const startSec = beatsToSeconds(note.start, tempo);
    const durSec = beatsToSeconds(note.duration, tempo);
    s.triggerAttackRelease(note.pitch, durSec * 0.9, now + startSec);
    maxEnd = Math.max(maxEnd, startSec + durSec);
  }

  await wait(maxEnd * 1000 + 300);
}

async function playChoraleSatb(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 72;
  const voices = config.voices ?? {};
  const voiceNames = ["soprano", "alto", "tenor", "bass"];

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  let maxEnd = 0;

  for (const voiceName of voiceNames) {
    const voiceNotes = voices[voiceName];
    if (!voiceNotes || voiceNotes.length === 0) continue;

    for (const note of voiceNotes) {
      const startSec = beatsToSeconds(note.start, tempo);
      const durSec = beatsToSeconds(note.duration, tempo);
      s.triggerAttackRelease(note.pitch, durSec * 0.9, now + startSec);
      maxEnd = Math.max(maxEnd, startSec + durSec);
    }
  }

  await wait(maxEnd * 1000 + 500);
}

async function playProgressionBlock(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 100;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  const s = await ensureAudio();
  const now = Tone.now() + 0.05;

  let maxEnd = 0;

  for (const note of notes) {
    const startSec = beatsToSeconds(note.start, tempo);
    const durSec = beatsToSeconds(note.duration, tempo);
    const pitches = note.pitch.includes(",")
      ? note.pitch.split(",").map((p) => p.trim())
      : [note.pitch];
    s.triggerAttackRelease(pitches, durSec * 0.9, now + startSec);
    maxEnd = Math.max(maxEnd, startSec + durSec);
  }

  await wait(maxEnd * 1000 + 300);
}

async function playRhythmPercussion(config: AudioConfig): Promise<void> {
  const tempo = config.tempo ?? 120;
  const notes = config.notes ?? [];
  if (notes.length === 0) return;

  // Percussive click using MetalSynth (intentionally not using piano sampler)
  const reverb = new Tone.Reverb({ decay: 0.5, wet: 0.08 }).toDestination();
  await reverb.ready;
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
