import * as Tone from "tone";
import type {
  NoteName,
  DiatonicDegree,
  IntervalName,
  ChordQuality,
  PlayDegreeOptions,
  ResolutionOptions,
  PlayIntervalOptions,
  PlayChordOptions,
} from "@/types/audio";
import {
  isSampleTimbre,
  randomSampleTimbre,
  findNearestKey,
  sampleUrl,
  loadSample,
  type SampleTimbre,
} from "./timbre";

// ─── Music Theory Maps ──────────────────────────────────────

const NOTE_SEMITONES: Record<string, number> = {
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

const SEMITONE_TO_NOTE: string[] = [
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

const DEGREE_SEMITONES: Record<DiatonicDegree, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};

const INTERVAL_SEMITONES: Record<IntervalName, number> = {
  P1: 0,
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  TT: 6,
  P5: 7,
  m6: 8,
  M6: 9,
  m7: 10,
  M7: 11,
  P8: 12,
};

const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
};

/** Strip trailing octave digits from a key name (e.g. "C4" -> "C") */
function stripOctave(key: string): NoteName {
  return key.replace(/\d+$/, "") as NoteName;
}

function noteToMidi(name: NoteName, octave: number): number {
  const clean = stripOctave(name);
  const semi = NOTE_SEMITONES[clean];
  if (semi === undefined) throw new Error(`Unknown note: ${name}`);
  return (octave + 1) * 12 + semi;
}

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = SEMITONE_TO_NOTE[midi % 12]!;
  return `${note}${octave}`;
}

function degreeToNote(
  key: NoteName,
  degree: DiatonicDegree,
  octave: number,
): string {
  const rootMidi = noteToMidi(key, octave);
  return midiToNoteName(rootMidi + DEGREE_SEMITONES[degree]);
}

// ─── Playback Effects ───────────────────────────────────────

export interface PlaybackEffectsConfig {
  filterCutoff?: number; // Hz, default 2000
  reverbWet?: number; // 0-1, default 0.12
  reverbDecay?: number; // seconds, default 1.5
}

const PLAYBACK_DEFAULTS: Required<PlaybackEffectsConfig> = {
  filterCutoff: 2000,
  reverbWet: 0.12,
  reverbDecay: 1.5,
};

// ─── Piano-like FM Synth Config ─────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PIANO_SYNTH_OPTIONS: Record<string, any> = {
  harmonicity: 3,
  modulationIndex: 1.5,
  oscillator: { type: "sine" },
  envelope: { attack: 0.005, decay: 0.6, sustain: 0.3, release: 2.0 },
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.2 },
  volume: 0,
};

// ─── Playback Engine ────────────────────────────────────────

export class PlaybackEngine {
  private synth: Tone.FMSynth | null = null;
  private polySynth: Tone.PolySynth | null = null;
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private isActive = false;
  private stopRequested = false;

  constructor(effects?: PlaybackEffectsConfig) {
    const config = { ...PLAYBACK_DEFAULTS, ...effects };

    // Chain: synths → filter → reverb → destination
    this.reverb = new Tone.Reverb({
      decay: config.reverbDecay,
      wet: config.reverbWet,
      preDelay: 0.01,
    }).toDestination();
    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: config.filterCutoff,
      rolloff: -12,
      Q: 0.5,
    }).connect(this.reverb);
  }

  get playing(): boolean {
    return this.isActive;
  }

  private getSynth(): Tone.FMSynth {
    if (!this.synth) {
      this.synth = new Tone.FMSynth(PIANO_SYNTH_OPTIONS).connect(this.filter);
    }
    return this.synth;
  }

  private getPolySynth(): Tone.PolySynth {
    if (!this.polySynth) {
      this.polySynth = new Tone.PolySynth(
        Tone.FMSynth,
        PIANO_SYNTH_OPTIONS,
      ).connect(this.filter);
    }
    return this.polySynth;
  }

  async playDegree(options: PlayDegreeOptions): Promise<void> {
    const { degree, key, octave = 4, duration = 1, timbre } = options;
    this.isActive = true;
    this.stopRequested = false;

    // Resolve timbre: 'varied' picks random sample, specific sample timbres use samples
    const resolvedTimbre = timbre === "varied" ? randomSampleTimbre() : timbre;

    if (resolvedTimbre && isSampleTimbre(resolvedTimbre)) {
      try {
        await this.playSample(
          resolvedTimbre as SampleTimbre,
          key,
          degree,
          duration,
        );
        this.isActive = false;
        return;
      } catch {
        // Fall through to synth on sample load failure
      }
    }

    const note = degreeToNote(key, degree, octave);
    const synth = this.getSynth();
    synth.triggerAttackRelease(note, duration, Tone.now());

    await this.wait(duration * 1000 + 100);
    this.isActive = false;
  }

  private async playSample(
    timbre: SampleTimbre,
    key: NoteName,
    degree: DiatonicDegree,
    duration: number,
  ): Promise<void> {
    const nearestKey = findNearestKey(key);
    const url = sampleUrl(timbre, nearestKey, degree);
    const rawCtx = Tone.getContext().rawContext as AudioContext;
    const buffer = await loadSample(url, rawCtx);

    const source = rawCtx.createBufferSource();
    source.buffer = buffer;

    const gain = rawCtx.createGain();
    gain.gain.setValueAtTime(0.7, rawCtx.currentTime);
    gain.gain.linearRampToValueAtTime(
      0.001,
      rawCtx.currentTime + Math.min(duration + 0.5, buffer.duration),
    );

    source.connect(gain);
    gain.connect(rawCtx.destination);
    source.start();

    await this.wait(Math.min(duration + 0.5, buffer.duration) * 1000 + 100);
    source.stop();
    source.disconnect();
    gain.disconnect();
  }

  async playDegreeSequence(
    degrees: DiatonicDegree[],
    options: Omit<PlayDegreeOptions, "degree">,
  ): Promise<void> {
    const { key, octave = 4, duration = 0.6 } = options;
    this.isActive = true;
    this.stopRequested = false;

    const synth = this.getSynth();
    const gap = duration * 0.15; // slight overlap for legato feel
    const now = Tone.now();

    for (let i = 0; i < degrees.length; i++) {
      if (this.stopRequested) break;
      const note = degreeToNote(key, degrees[i]!, octave);
      synth.triggerAttackRelease(note, duration, now + i * (duration - gap));
    }

    await this.wait(degrees.length * (duration - gap) * 1000 + 200);
    this.isActive = false;
  }

  async playResolution(options: ResolutionOptions): Promise<void> {
    const { fromDegree, key } = options;
    if (fromDegree === 1) return; // already at tonic

    // Build stepwise path to tonic using shortest direction
    const path: DiatonicDegree[] = [];
    if (fromDegree <= 4) {
      // Resolve downward: e.g. 3 -> 2 -> 1
      for (let d = fromDegree; d >= 1; d--) {
        path.push(d as DiatonicDegree);
      }
    } else {
      // Resolve upward: e.g. 5 -> 6 -> 7 -> 1(octave above)
      for (let d = fromDegree; d <= 7; d++) {
        path.push(d as DiatonicDegree);
      }
      path.push(1); // tonic above (handled by octave shift in playback)
    }

    this.isActive = true;
    this.stopRequested = false;

    const synth = this.getSynth();
    const stepDuration = 0.25;
    const overlap = 0.05;
    const now = Tone.now();
    const baseOctave = 4;

    for (let i = 0; i < path.length; i++) {
      if (this.stopRequested) break;
      const degree = path[i]!;
      const isLast = i === path.length - 1;
      const dur = isLast ? stepDuration * 1.5 : stepDuration; // final tonic rings longer

      // If resolving upward and we've wrapped to degree 1, play octave above
      const octave =
        fromDegree > 4 && degree === 1 ? baseOctave + 1 : baseOctave;
      const note = degreeToNote(key, degree, octave);
      synth.triggerAttackRelease(note, dur, now + i * (stepDuration - overlap));
    }

    await this.wait(path.length * (stepDuration - overlap) * 1000 + 300);
    this.isActive = false;
  }

  async playInterval(options: PlayIntervalOptions): Promise<void> {
    const {
      interval,
      key,
      mode = "melodic",
      octave = 4,
      duration = 0.8,
      gap = 0.4,
    } = options;
    const baseDegree = options.baseDegree ?? 1;
    const rootMidi = noteToMidi(key, octave) + DEGREE_SEMITONES[baseDegree];
    const topMidi = rootMidi + INTERVAL_SEMITONES[interval];
    const bottomNote = midiToNoteName(rootMidi);
    const topNote = midiToNoteName(topMidi);

    this.isActive = true;
    this.stopRequested = false;

    if (mode === "harmonic") {
      const poly = this.getPolySynth();
      poly.triggerAttackRelease([bottomNote, topNote], duration, Tone.now());
      await this.wait(duration * 1000 + 100);
    } else {
      const synth = this.getSynth();
      const now = Tone.now();
      synth.triggerAttackRelease(bottomNote, duration, now);
      synth.triggerAttackRelease(topNote, duration, now + duration + gap);
      await this.wait((duration * 2 + gap) * 1000 + 100);
    }

    this.isActive = false;
  }

  async playChord(options: PlayChordOptions): Promise<void> {
    const {
      quality,
      root,
      inversion = "root",
      mode = "block",
      octave = 4,
      duration = 1.2,
    } = options;
    const intervals = CHORD_INTERVALS[quality];
    if (!intervals) throw new Error(`Unknown chord quality: ${quality}`);

    const rootMidi = noteToMidi(root, octave);
    let midiNotes = intervals.map((semi) => rootMidi + semi);

    // Apply inversions
    if (inversion === "first" && midiNotes.length >= 2) {
      midiNotes[0] = midiNotes[0]! + 12; // raise root octave
      midiNotes = [
        midiNotes[1]!,
        midiNotes[2]!,
        ...midiNotes.slice(3),
        midiNotes[0]!,
      ];
    } else if (inversion === "second" && midiNotes.length >= 3) {
      midiNotes[0] = midiNotes[0]! + 12;
      midiNotes[1] = midiNotes[1]! + 12;
      midiNotes = [
        midiNotes[2]!,
        ...midiNotes.slice(3),
        midiNotes[0]!,
        midiNotes[1]!,
      ];
    }

    const notes = midiNotes.map(midiToNoteName);

    this.isActive = true;
    this.stopRequested = false;

    if (mode === "block") {
      // Block chord - all notes at once, bass slightly louder
      const poly = this.getPolySynth();
      // Play bass note separately with more volume
      const bassSynth = this.getSynth();
      bassSynth.volume.value = 0; // slightly louder than polySynth at -3
      bassSynth.triggerAttackRelease(notes[0]!, duration, Tone.now());
      if (notes.length > 1) {
        poly.triggerAttackRelease(notes.slice(1), duration, Tone.now());
      }
      await this.wait(duration * 1000 + 100);
      bassSynth.volume.value = -3; // restore
    } else {
      // Arpeggiated
      const synth = this.getSynth();
      const arpGap = 0.12;
      const now = Tone.now();
      for (let i = 0; i < notes.length; i++) {
        synth.triggerAttackRelease(notes[i]!, duration, now + i * arpGap);
      }
      await this.wait((notes.length * arpGap + duration) * 1000 + 100);
    }

    this.isActive = false;
  }

  stop(): void {
    this.stopRequested = true;
    this.synth?.triggerRelease();
    this.polySynth?.releaseAll();
    this.isActive = false;
  }

  dispose(): void {
    this.stop();
    this.synth?.dispose();
    this.synth = null;
    this.polySynth?.dispose();
    this.polySynth = null;
    this.filter.dispose();
    this.reverb.dispose();
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
