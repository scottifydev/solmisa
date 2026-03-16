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
import { noteToMidi, midiToNoteName } from "./music-theory";
import { ensureAudio, releaseAll } from "./solmisa-piano";

// ─── Music Theory Maps ──────────────────────────────────────

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

export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  dominant7: [0, 4, 7, 10],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
};

function degreeToNote(
  key: NoteName,
  degree: DiatonicDegree,
  octave: number,
): string {
  const rootMidi = noteToMidi(key, octave);
  return midiToNoteName(rootMidi + DEGREE_SEMITONES[degree]);
}

// ─── Playback Effects Config (kept for API compatibility) ────

export interface PlaybackEffectsConfig {
  filterCutoff?: number;
  reverbWet?: number;
  reverbDecay?: number;
}

// ─── Playback Engine ────────────────────────────────────────

export class PlaybackEngine {
  private isActive = false;
  private stopRequested = false;

  constructor(_effects?: PlaybackEffectsConfig) {
    // Effects config no longer used — audio routed through solmisa-piano singleton
  }

  get playing(): boolean {
    return this.isActive;
  }

  async playDegree(options: PlayDegreeOptions): Promise<void> {
    const { degree, key, octave = 4, duration = 2, timbre } = options;
    this.isActive = true;
    this.stopRequested = false;

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
        // Fall through to piano on sample load failure
      }
    }

    const note = degreeToNote(key, degree, octave);
    const s = await ensureAudio();
    s.triggerAttackRelease(note, duration, Tone.now());

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

    const s = await ensureAudio();
    const gap = duration * 0.15;
    const now = Tone.now();

    for (let i = 0; i < degrees.length; i++) {
      if (this.stopRequested) break;
      const note = degreeToNote(key, degrees[i]!, octave);
      s.triggerAttackRelease(note, duration, now + i * (duration - gap));
    }

    await this.wait(degrees.length * (duration - gap) * 1000 + 200);
    this.isActive = false;
  }

  async playResolution(options: ResolutionOptions): Promise<void> {
    const { fromDegree, key } = options;
    if (fromDegree === 1) return;

    const path: DiatonicDegree[] = [];
    if (fromDegree <= 4) {
      for (let d = fromDegree; d >= 1; d--) {
        path.push(d as DiatonicDegree);
      }
    } else {
      for (let d = fromDegree; d <= 7; d++) {
        path.push(d as DiatonicDegree);
      }
      path.push(1);
    }

    this.isActive = true;
    this.stopRequested = false;

    const s = await ensureAudio();
    const stepDuration = 0.25;
    const overlap = 0.05;
    const now = Tone.now();
    const baseOctave = 4;

    for (let i = 0; i < path.length; i++) {
      if (this.stopRequested) break;
      const degree = path[i]!;
      const isLast = i === path.length - 1;
      const dur = isLast ? stepDuration * 1.5 : stepDuration;

      const octave =
        fromDegree > 4 && degree === 1 ? baseOctave + 1 : baseOctave;
      const note = degreeToNote(key, degree, octave);
      s.triggerAttackRelease(note, dur, now + i * (stepDuration - overlap));
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

    const s = await ensureAudio();

    if (mode === "harmonic") {
      s.triggerAttackRelease([bottomNote, topNote], duration, Tone.now());
      await this.wait(duration * 1000 + 100);
    } else {
      const now = Tone.now();
      s.triggerAttackRelease(bottomNote, duration, now);
      s.triggerAttackRelease(topNote, duration, now + duration + gap);
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

    if (inversion === "first" && midiNotes.length >= 2) {
      midiNotes[0] = midiNotes[0]! + 12;
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

    const s = await ensureAudio();

    if (mode === "block") {
      s.triggerAttackRelease(notes, duration, Tone.now(), 0.7);
      await this.wait(duration * 1000 + 100);
    } else {
      const arpGap = 0.12;
      const now = Tone.now();
      for (let i = 0; i < notes.length; i++) {
        s.triggerAttackRelease(notes[i]!, duration, now + i * arpGap);
      }
      await this.wait((notes.length * arpGap + duration) * 1000 + 100);
    }

    this.isActive = false;
  }

  stop(): void {
    this.stopRequested = true;
    releaseAll();
    this.isActive = false;
  }

  dispose(): void {
    this.stop();
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
