import * as Tone from "tone";
import type {
  NoteName,
  DroneOptions,
  CadenceOptions,
  RandomKeyOptions,
} from "@/types/audio";
import { MODULE_KEY_POOLS } from "@/types/audio";
import { stripOctave, noteToMidi, midiToNoteName } from "./music-theory";
import { ensureAudio } from "./solmisa-piano";

function majorTriadMidi(rootMidi: number): number[] {
  return [rootMidi, rootMidi + 4, rootMidi + 7];
}

function minorTriadMidi(rootMidi: number): number[] {
  return [rootMidi, rootMidi + 3, rootMidi + 7];
}

// ─── Cadence chord builders ─────────────────────────────────

function buildMajorCadenceChords(
  key: NoteName,
  bassOctave: number,
): string[][] {
  const root = noteToMidi(key, bassOctave);
  const upperRoot = noteToMidi(key, bassOctave + 1);

  // I: bass root + upper major triad
  const I = [
    midiToNoteName(root),
    ...majorTriadMidi(upperRoot).map(midiToNoteName),
  ];
  // IV: bass 4th + upper major triad on 4th
  const IV = [
    midiToNoteName(root + 5),
    ...majorTriadMidi(upperRoot + 5).map(midiToNoteName),
  ];
  // V: bass 5th + upper major triad on 5th
  const V = [
    midiToNoteName(root + 7),
    ...majorTriadMidi(upperRoot + 7).map(midiToNoteName),
  ];
  return [I, IV, V, [...I]];
}

function buildMinorCadenceChords(
  key: NoteName,
  bassOctave: number,
): string[][] {
  const root = noteToMidi(key, bassOctave);
  const upperRoot = noteToMidi(key, bassOctave + 1);

  // i: bass root + upper minor triad
  const i = [
    midiToNoteName(root),
    ...minorTriadMidi(upperRoot).map(midiToNoteName),
  ];
  // iv: bass 4th + upper minor triad on 4th
  const iv = [
    midiToNoteName(root + 5),
    ...minorTriadMidi(upperRoot + 5).map(midiToNoteName),
  ];
  // V: bass 5th + upper major triad on 5th (harmonic minor — raised 7th)
  const V = [
    midiToNoteName(root + 7),
    ...majorTriadMidi(upperRoot + 7).map(midiToNoteName),
  ];
  return [i, iv, V, [...i]];
}

function buildCadenceChords(
  key: NoteName,
  bassOctave: number,
  cadenceType: "major" | "minor" = "major",
): string[][] {
  return cadenceType === "minor"
    ? buildMinorCadenceChords(key, bassOctave)
    : buildMajorCadenceChords(key, bassOctave);
}

// ─── Pad Voice Configuration ─────────────────────────────────

interface PadVoice {
  type: OscillatorType;
  detuneCents: number;
  octaveOffset: number;
  gain: number;
}

const PAD_VOICES: PadVoice[] = [
  // Core unison layer — 6 voices with symmetric detune spread
  { type: "sine", detuneCents: -12, octaveOffset: 0, gain: 0.3 },
  { type: "sine", detuneCents: +12, octaveOffset: 0, gain: 0.3 },
  { type: "triangle", detuneCents: -6, octaveOffset: 0, gain: 0.2 },
  { type: "triangle", detuneCents: +6, octaveOffset: 0, gain: 0.2 },
  { type: "sawtooth", detuneCents: -18, octaveOffset: 0, gain: 0.08 },
  { type: "sawtooth", detuneCents: +18, octaveOffset: 0, gain: 0.08 },
  // Sub-octave for warmth
  { type: "sine", detuneCents: 0, octaveOffset: -1, gain: 0.18 },
  // Upper-octave shimmer
  { type: "sine", detuneCents: 0, octaveOffset: +1, gain: 0.04 },
];

// ─── Effects Defaults ───────────────────────────────────────

export interface DroneEffectsConfig {
  filterCutoff?: number; // Hz, default 600
  reverbWet?: number; // 0-1, default 0.25
  reverbDecay?: number; // seconds, default 3.5
  chorusDepth?: number; // 0-1, default 0.5
  chorusFrequency?: number; // Hz, default 0.3
  compressorThreshold?: number; // dB, default -18
}

const DEFAULT_EFFECTS: Required<DroneEffectsConfig> = {
  filterCutoff: 600,
  reverbWet: 0.25,
  reverbDecay: 3.5,
  chorusDepth: 0.5,
  chorusFrequency: 0.3,
  compressorThreshold: -18,
};

// ─── Drone Generator Class ──────────────────────────────────

const FADE_TIME = 0.4; // seconds for volume fades
const CROSSFADE_TIME = 0.6; // seconds for key change crossfade

export class DroneGenerator {
  private oscillators: Tone.Oscillator[] = [];
  private voiceGains: Tone.Gain[] = [];
  private gainNode: Tone.Gain;
  private filter: Tone.Filter;
  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;
  private filterLfo: Tone.LFO;
  private currentKey: NoteName | null = null;
  private currentOctave = 4;
  private targetVolume = 0.35;
  private isPlaying = false;
  private cadenceFilter: Tone.Filter | null = null;
  private cadenceReverb: Tone.Reverb | null = null;
  private effectsConfig: Required<DroneEffectsConfig>;

  constructor(
    destination: Tone.ToneAudioNode = Tone.getDestination(),
    effects?: DroneEffectsConfig,
  ) {
    this.effectsConfig = { ...DEFAULT_EFFECTS, ...effects };

    // Chain: voice gains → filter → chorus → reverb → compressor → master gain → destination
    this.gainNode = new Tone.Gain(0).connect(destination);
    this.compressor = new Tone.Compressor({
      threshold: this.effectsConfig.compressorThreshold,
      ratio: 4,
      attack: 0.01,
      release: 0.2,
    }).connect(this.gainNode);
    this.reverb = new Tone.Reverb({
      decay: this.effectsConfig.reverbDecay,
      wet: this.effectsConfig.reverbWet,
      preDelay: 0.01,
    }).connect(this.compressor);
    this.chorus = new Tone.Chorus({
      frequency: this.effectsConfig.chorusFrequency,
      delayTime: 3.5,
      depth: this.effectsConfig.chorusDepth,
      wet: 0.35,
    }).connect(this.reverb);
    this.chorus.start();
    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: this.effectsConfig.filterCutoff,
      rolloff: -24,
      Q: 0.7,
    }).connect(this.chorus);

    // Gentle LFO on filter cutoff for organic movement
    this.filterLfo = new Tone.LFO({
      frequency: 0.08,
      min: this.effectsConfig.filterCutoff * 0.7,
      max: this.effectsConfig.filterCutoff * 1.3,
      type: "sine",
    }).connect(this.filter.frequency);
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get key(): NoteName | null {
    return this.currentKey;
  }

  private computeVoiceFreq(baseFreq: number, voice: PadVoice): number {
    const octaveMultiplier = Math.pow(2, voice.octaveOffset);
    const detuneMultiplier = Math.pow(2, voice.detuneCents / 1200);
    return baseFreq * octaveMultiplier * detuneMultiplier;
  }

  async start(options: DroneOptions): Promise<void> {
    const { key: rawKey, octave = 4, volume = 0.35 } = options;
    const key = stripOctave(rawKey);
    this.targetVolume = volume;

    if (this.isPlaying && this.currentKey === key) return;

    if (this.isPlaying) {
      await this.changeKey(key, octave);
      return;
    }

    const baseFreq = Tone.Frequency(`${key}${octave}`).toFrequency();

    // Create pad voices — each with its own gain for individual level control
    for (const voice of PAD_VOICES) {
      const freq = this.computeVoiceFreq(baseFreq, voice);
      const voiceGain = new Tone.Gain(voice.gain).connect(this.filter);
      const osc = new Tone.Oscillator({
        type: voice.type,
        frequency: freq,
      }).connect(voiceGain);
      this.voiceGains.push(voiceGain);
      this.oscillators.push(osc);
    }

    // Start silent then fade in
    this.gainNode.gain.setValueAtTime(0, Tone.now());
    for (const osc of this.oscillators) osc.start();
    this.filterLfo.start();
    this.gainNode.gain.linearRampToValueAtTime(
      this.targetVolume,
      Tone.now() + FADE_TIME,
    );

    this.currentKey = key;
    this.currentOctave = octave;
    this.isPlaying = true;
  }

  stop(): void {
    if (!this.isPlaying) return;

    const now = Tone.now();
    this.gainNode.gain.linearRampToValueAtTime(0, now + FADE_TIME);

    // Capture references for cleanup after fade
    const oscs = [...this.oscillators];
    const gains = [...this.voiceGains];
    setTimeout(
      () => {
        for (const osc of oscs) {
          osc.stop();
          osc.dispose();
        }
        for (const g of gains) g.dispose();
      },
      FADE_TIME * 1000 + 50,
    );

    this.filterLfo.stop();
    this.oscillators = [];
    this.voiceGains = [];
    this.currentKey = null;
    this.isPlaying = false;
  }

  async changeKey(rawKey: NoteName, octave = 4): Promise<void> {
    const key = stripOctave(rawKey);
    if (!this.isPlaying || this.oscillators.length === 0) {
      await this.start({ key, octave, volume: this.targetVolume });
      return;
    }

    const baseFreq = Tone.Frequency(`${key}${octave}`).toFrequency();
    const now = Tone.now();

    // Smoothly ramp all voices to new frequencies
    for (let i = 0; i < this.oscillators.length; i++) {
      const voice = PAD_VOICES[i]!;
      const freq = this.computeVoiceFreq(baseFreq, voice);
      this.oscillators[i]!.frequency.linearRampToValueAtTime(
        freq,
        now + CROSSFADE_TIME,
      );
    }

    this.currentKey = key;
    this.currentOctave = octave;
  }

  setVolume(volume: number): void {
    this.targetVolume = volume;
    if (this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(volume, Tone.now() + 0.05);
    }
  }

  setEffects(config: DroneEffectsConfig): void {
    if (config.filterCutoff !== undefined) {
      this.filter.frequency.linearRampToValueAtTime(
        config.filterCutoff,
        Tone.now() + 0.1,
      );
      this.filterLfo.min = config.filterCutoff * 0.7;
      this.filterLfo.max = config.filterCutoff * 1.3;
    }
    if (config.reverbWet !== undefined) {
      this.reverb.wet.linearRampToValueAtTime(
        config.reverbWet,
        Tone.now() + 0.1,
      );
    }
    if (config.chorusDepth !== undefined) {
      this.chorus.depth = config.chorusDepth;
    }
    Object.assign(this.effectsConfig, config);
  }

  private getCadenceChain(): Tone.ToneAudioNode {
    if (!this.cadenceReverb) {
      this.cadenceReverb = new Tone.Reverb({
        decay: 1.5,
        wet: 0.12,
        preDelay: 0.01,
      }).toDestination();
      this.cadenceFilter = new Tone.Filter({
        type: "lowpass",
        frequency: 2000,
        rolloff: -12,
        Q: 0.5,
      }).connect(this.cadenceReverb);
    }
    return this.cadenceFilter!;
  }

  async playCadence(options?: Partial<CadenceOptions>): Promise<void> {
    const key = stripOctave(options?.key ?? this.currentKey ?? "C");
    const tempo = options?.tempo ?? 100;
    const chordDuration = (60 / tempo) * 0.6; // ~600ms at 100bpm
    const gap = 0.1; // 100ms gap between chords

    // Temporarily duck drone volume during cadence
    const wasDroneVolume = this.targetVolume;
    if (this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(
        wasDroneVolume * 0.3,
        Tone.now() + 0.1,
      );
    }

    const s = await ensureAudio();

    const chords = buildCadenceChords(
      key as NoteName,
      3,
      options?.cadenceType ?? "major",
    );
    const now = Tone.now() + 0.05;

    for (let i = 0; i < chords.length; i++) {
      const time = now + i * (chordDuration + gap);
      s.triggerAttackRelease(chords[i]!, chordDuration, time, 0.5);
    }

    const totalTime = chords.length * (chordDuration + gap);

    return new Promise<void>((resolve) => {
      setTimeout(
        () => {
          if (this.isPlaying) {
            this.gainNode.gain.linearRampToValueAtTime(
              wasDroneVolume,
              Tone.now() + 0.2,
            );
          }
          resolve();
        },
        totalTime * 1000 + 100,
      );
    });
  }

  dispose(): void {
    this.stop();
    this.cadenceFilter?.dispose();
    this.cadenceFilter = null;
    this.cadenceReverb?.dispose();
    this.cadenceReverb = null;
    this.filterLfo.stop();
    this.filterLfo.dispose();
    this.filter.dispose();
    this.chorus.dispose();
    this.reverb.dispose();
    this.compressor.dispose();
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
  const keys = Object.keys(MODULE_KEY_POOLS)
    .map(Number)
    .sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (moduleOrder >= keys[i]!) {
      return MODULE_KEY_POOLS[keys[i]!]!;
    }
  }
  return MODULE_KEY_POOLS[1]!;
}
