// ─── Musical Primitives ──────────────────────────────────────

export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type DiatonicDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ChromaticDegree =
  | "1"
  | "b2"
  | "2"
  | "b3"
  | "3"
  | "4"
  | "#4"
  | "5"
  | "b6"
  | "6"
  | "b7"
  | "7";

export type IntervalName =
  | "P1"
  | "m2"
  | "M2"
  | "m3"
  | "M3"
  | "P4"
  | "TT"
  | "P5"
  | "m6"
  | "M6"
  | "m7"
  | "M7"
  | "P8";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant7"
  | "major7"
  | "minor7";

export type ChordInversion = "root" | "first" | "second" | "third";

export type Timbre =
  | "sine"
  | "piano"
  | "bell"
  | "guitar"
  | "strings"
  | "organ"
  | "brass";

// ─── Drone (SCO-38) ──────────────────────────────────────────

export interface DroneOptions {
  key: NoteName;
  octave?: number;
  volume?: number;
  timbre?: Timbre;
}

export interface CadenceOptions {
  key: NoteName;
  tempo?: number;
  progression?: string[];
  timbre?: Timbre;
}

export interface RandomKeyOptions {
  pool: NoteName[];
  excludeCurrent?: boolean;
}

export interface UseDroneReturn {
  start: (options: DroneOptions) => Promise<void>;
  stop: () => void;
  changeKey: (key: NoteName) => Promise<void>;
  playCadence: (options?: Partial<CadenceOptions>) => Promise<void>;
  isPlaying: boolean;
  currentKey: NoteName | null;
}

// ─── Playback (SCO-39) ───────────────────────────────────────

export interface PlayDegreeOptions {
  degree: DiatonicDegree;
  key: NoteName;
  octave?: number;
  duration?: number;
  timbre?: Timbre;
}

export interface ResolutionOptions {
  fromDegree: DiatonicDegree;
  key: NoteName;
  stepwise?: boolean;
  timbre?: Timbre;
}

export interface UsePlaybackReturn {
  playDegree: (options: PlayDegreeOptions) => Promise<void>;
  playDegreeSequence: (degrees: DiatonicDegree[], options: Omit<PlayDegreeOptions, "degree">) => Promise<void>;
  playResolution: (options: ResolutionOptions) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
}

// ─── Pitch Detection ─────────────────────────────────────────

export interface PitchDetectionResult {
  pitch: number | null;
  clarity: number;
  note: NoteName | null;
  cents: number;
}

export interface PitchDetectionOptions {
  minClarity?: number;
  smoothingWindow?: number;
  tolerance?: number;
}

// ─── Audio Assets ────────────────────────────────────────────

export interface AudioAssetRef {
  bucket: string;
  path: string;
  url?: string;
}

// ─── Module Key Pools ────────────────────────────────────────

export const MODULE_KEY_POOLS: Record<number, readonly NoteName[]> = {
  1: ["C"],
  2: ["C", "G", "F"],
  3: ["C", "G", "F", "D", "Bb"],
  4: ["C", "G", "F", "D", "Bb", "A", "Eb"],
  5: ["C", "G", "F", "D", "Bb", "A", "Eb", "E", "Ab"],
} as const;

export type AudioState = "idle" | "playing" | "paused" | "loading" | "error";
