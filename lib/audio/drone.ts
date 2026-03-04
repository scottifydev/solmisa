import * as Tone from "tone";
import type { NoteName, DroneOptions, CadenceOptions, RandomKeyOptions } from "@/types/audio";
import { MODULE_KEY_POOLS } from "@/types/audio";

// ─── Note / Chord Helpers ────────────────────────────────────

const NOTE_SEMITONES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

const SEMITONE_TO_NOTE: string[] = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
];

function noteToMidi(name: NoteName, octave: number): number {
  const semi = NOTE_SEMITONES[name];
  if (semi === undefined) throw new Error(`Unknown note: ${name}`);
  return (octave + 1) * 12 + semi;
}

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = SEMITONE_TO_NOTE[midi % 12]!;
  return `${note}${octave}`;
}

function majorTriadMidi(rootMidi: number): number[] {
  return [rootMidi, rootMidi + 4, rootMidi + 7];
}

// ─── Cadence chord builder (I-IV-V-I) ───────────────────────

function buildCadenceChords(key: NoteName, bassOctave: number): string[][] {
  const root = noteToMidi(key, bassOctave);
  const upperOctave = bassOctave + 1;
  const upperRoot = noteToMidi(key, upperOctave);

  // I: bass root + upper triad
  const I = [midiToNoteName(root), ...majorTriadMidi(upperRoot).map(midiToNoteName)];
  // IV: bass 4th + upper triad on 4th
  const iv = root + 5;
  const IV = [midiToNoteName(iv), ...majorTriadMidi(noteToMidi(key, upperOctave) + 5).map(midiToNoteName)];
  // V: bass 5th + upper triad on 5th
  const v = root + 7;
  const V = [midiToNoteName(v), ...majorTriadMidi(noteToMidi(key, upperOctave) + 7).map(midiToNoteName)];
  // I (final): same as I
  const Ifinal = [...I];

  return [I, IV, V, Ifinal];
}

// ─── Drone Generator Class ──────────────────────────────────

const FADE_TIME = 0.4; // seconds for volume fades
const CROSSFADE_TIME = 0.6; // seconds for key change crossfade

export class DroneGenerator {
  private sineOsc: Tone.Oscillator | null = null;
  private triOsc: Tone.Oscillator | null = null;
  private gainNode: Tone.Gain;
  private currentKey: NoteName | null = null;
  private targetVolume = 0.35;
  private isPlaying = false;
  private cadenceSynth: Tone.PolySynth | null = null;

  constructor(destination: Tone.ToneAudioNode = Tone.getDestination()) {
    this.gainNode = new Tone.Gain(0).connect(destination);
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get key(): NoteName | null {
    return this.currentKey;
  }

  async start(options: DroneOptions): Promise<void> {
    const { key, octave = 4, volume = 0.35 } = options;
    this.targetVolume = volume;

    if (this.isPlaying && this.currentKey === key) return;

    if (this.isPlaying) {
      await this.changeKey(key, octave);
      return;
    }

    const freq = Tone.Frequency(`${key}${octave}`).toFrequency();

    // Layered sine + triangle with slight detune for warm timbre
    this.sineOsc = new Tone.Oscillator({ type: "sine", frequency: freq })
      .connect(this.gainNode);
    this.triOsc = new Tone.Oscillator({ type: "triangle", frequency: freq * 1.002 })
      .connect(this.gainNode);

    // Start silent then fade in
    this.gainNode.gain.setValueAtTime(0, Tone.now());
    this.sineOsc.start();
    this.triOsc.start();
    this.gainNode.gain.linearRampToValueAtTime(this.targetVolume, Tone.now() + FADE_TIME);

    this.currentKey = key;
    this.isPlaying = true;
  }

  stop(): void {
    if (!this.isPlaying) return;

    const now = Tone.now();
    this.gainNode.gain.linearRampToValueAtTime(0, now + FADE_TIME);

    // Dispose oscillators after fade out
    const sine = this.sineOsc;
    const tri = this.triOsc;
    setTimeout(() => {
      sine?.stop();
      sine?.dispose();
      tri?.stop();
      tri?.dispose();
    }, FADE_TIME * 1000 + 50);

    this.sineOsc = null;
    this.triOsc = null;
    this.currentKey = null;
    this.isPlaying = false;
  }

  async changeKey(key: NoteName, octave = 4): Promise<void> {
    if (!this.isPlaying || !this.sineOsc || !this.triOsc) {
      await this.start({ key, octave, volume: this.targetVolume });
      return;
    }

    const freq = Tone.Frequency(`${key}${octave}`).toFrequency();
    const now = Tone.now();

    // Crossfade: ramp frequency smoothly
    this.sineOsc.frequency.linearRampToValueAtTime(freq, now + CROSSFADE_TIME);
    this.triOsc.frequency.linearRampToValueAtTime(freq * 1.002, now + CROSSFADE_TIME);

    this.currentKey = key;
  }

  setVolume(volume: number): void {
    this.targetVolume = volume;
    if (this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(volume, Tone.now() + 0.05);
    }
  }

  async playCadence(options?: Partial<CadenceOptions>): Promise<void> {
    const key = options?.key ?? this.currentKey ?? "C";
    const tempo = options?.tempo ?? 100;
    const chordDuration = 60 / tempo * 0.6; // ~600ms at 100bpm
    const gap = 0.1; // 100ms gap between chords

    // Temporarily duck drone volume during cadence
    const wasDroneVolume = this.targetVolume;
    if (this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(wasDroneVolume * 0.3, Tone.now() + 0.1);
    }

    // Build cadence synth - piano-like timbre
    this.cadenceSynth?.dispose();
    this.cadenceSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.4 },
      volume: -6,
    }).toDestination();

    const chords = buildCadenceChords(key as NoteName, 3);
    const now = Tone.now() + 0.05;

    for (let i = 0; i < chords.length; i++) {
      const time = now + i * (chordDuration + gap);
      this.cadenceSynth.triggerAttackRelease(chords[i]!, chordDuration, time);
    }

    const totalTime = chords.length * (chordDuration + gap);

    // Restore drone volume after cadence
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.gainNode.gain.linearRampToValueAtTime(wasDroneVolume, Tone.now() + 0.2);
        }
        this.cadenceSynth?.dispose();
        this.cadenceSynth = null;
        resolve();
      }, totalTime * 1000 + 100);
    });
  }

  dispose(): void {
    this.stop();
    this.cadenceSynth?.dispose();
    this.cadenceSynth = null;
    this.gainNode.dispose();
  }
}

// ─── Random Key Selection ───────────────────────────────────

let lastKey: NoteName | null = null;

export function getRandomKey(options?: RandomKeyOptions): NoteName {
  const pool = options?.pool ?? (MODULE_KEY_POOLS[1] as NoteName[]);
  const exclude = options?.excludeCurrent !== false && lastKey ? [lastKey] : [];
  const candidates = pool.filter((k) => !exclude.includes(k));
  const pick = candidates.length > 0 ? candidates : pool;
  const chosen = pick[Math.floor(Math.random() * pick.length)]!;
  lastKey = chosen;
  return chosen;
}

export function getKeyPoolForModule(moduleOrder: number): readonly NoteName[] {
  // Find the highest matching pool (modules beyond 5 get all keys)
  const keys = Object.keys(MODULE_KEY_POOLS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (moduleOrder >= keys[i]!) {
      return MODULE_KEY_POOLS[keys[i]!]!;
    }
  }
  return MODULE_KEY_POOLS[1]!;
}
