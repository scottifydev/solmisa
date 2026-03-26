// ─── MIDI Parse Layer (SCO-461) ─────────────────────────────

export interface MidiNoteEvent {
  midi: number;
  name: string;
  pitch: string;
  octave: number;
  time: number;
  duration: number;
  velocity: number;
  ticks: number;
  durationTicks: number;
  bar: number;
}

export interface TempoEvent {
  ticks: number;
  bpm: number;
  time: number;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface ParsedStandard {
  title: string;
  tracks: {
    melody: MidiNoteEvent[];
    harmony: MidiNoteEvent[];
  };
  tempoEvents: TempoEvent[];
  timeSignature: TimeSignature;
  keySignature: string;
  durationSeconds: number;
  totalBars: number;
  ppq: number;
  textEvents: string[];
}

export type TrackRole = "melody" | "harmony";

// ─── Chord Detection (SCO-462) ──────────────────────────────

export type ChordQualityExtended =
  | "maj"
  | "min"
  | "dim"
  | "aug"
  | "dom7"
  | "maj7"
  | "min7"
  | "dim7"
  | "min7b5"
  | "dom9"
  | "min9"
  | "maj9"
  | "dom13"
  | "min11"
  | "sus4"
  | "sus2"
  | "6"
  | "min6";

export type VoicingType =
  | "full"
  | "rootless-a"
  | "rootless-b"
  | "shell"
  | "extended"
  | "unknown";

export interface VoicingTemplate {
  quality: ChordQualityExtended;
  type: VoicingType;
  intervals: number[];
  label: string;
}

export interface DetectedChord {
  symbol: string;
  root: string;
  rootMidi: number;
  quality: ChordQualityExtended;
  bass: string;
  notes: number[];
  time: number;
  duration: number;
  bar: number;
  beat: number;
  confidence: number;
  voicingType: VoicingType;
  source: "detected" | "text-event";
}

export interface HarmonicFunction {
  romanNumeral: string;
  degree: number;
  functionType: "tonic" | "subdominant" | "dominant" | "modal";
  isSecondary: boolean;
  secondaryTarget?: string;
  keyCenter: string;
}

export interface AnalyzedChord extends DetectedChord {
  function: HarmonicFunction;
  compatibleScales: string[];
  chordTones: number[];
  tensions: number[];
  avoidNotes: number[];
}

export type NoteCategory =
  | "root"
  | "chord-tone"
  | "tension"
  | "avoid"
  | "chromatic";

// ─── Notation (SCO-463) ─────────────────────────────────────

export interface QuantizedNote {
  keys: string[];
  duration: string;
  rest: boolean;
  dotted: boolean;
  tied: boolean;
  accidental?: string;
  bar: number;
  beat: number;
  degree?: number;
  noteCategory?: NoteCategory;
}

export interface QuantizedMeasure {
  notes: QuantizedNote[];
  chordSymbol?: string;
  chord?: AnalyzedChord;
  barNumber: number;
  rehearsalMark?: string;
}

export interface StandardNotation {
  measures: QuantizedMeasure[];
  keySignature: string;
  timeSignature: TimeSignature;
  title: string;
}

// ─── Playback (SCO-464) ─────────────────────────────────────

export type PlaybackState = "stopped" | "playing" | "paused";

export interface PlaybackRange {
  startBar: number;
  endBar: number;
}

export interface PlaybackSettings {
  tempo: number;
  tempoRatio: number;
  melodyMuted: boolean;
  harmonyMuted: boolean;
  melodyVolume: number;
  harmonyVolume: number;
  loop: boolean;
  loopRange: PlaybackRange | null;
  swing: number;
}

// ─── Tune Catalog (SCO-466) ─────────────────────────────────

export interface TuneSection {
  label: string;
  startBar: number;
  endBar: number;
}

export interface TuneMetadata {
  id: string;
  title: string;
  composer: string;
  key: string;
  form: string;
  bars: number;
  style: string;
  difficulty: 1 | 2 | 3;
  midiUrl: string;
  midiSource: "mckenzie" | "online-sequencer" | "custom";
  teaches: string;
  sections: TuneSection[];
}

// ─── Zustand Store ──────────────────────────────────────────

export interface StandardsLabState {
  selectedTuneId: string | null;
  catalog: TuneMetadata[];

  parsedStandard: ParsedStandard | null;
  parseStatus: "idle" | "loading" | "ready" | "error";
  parseError: string | null;

  detectedChords: AnalyzedChord[];
  chordDetectionStatus: "idle" | "running" | "ready" | "error";

  notation: StandardNotation | null;
  currentBar: number;

  playbackState: PlaybackState;
  playbackPosition: number;
  playbackSettings: PlaybackSettings;

  activeChordIndex: number;

  selectTune: (tuneId: string) => Promise<void>;
  loadMidi: (url: string, title?: string) => Promise<void>;
  setPlaybackState: (state: PlaybackState) => void;
  setPlaybackPosition: (time: number) => void;
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void;
  setCurrentBar: (bar: number) => void;
  setActiveChordIndex: (index: number) => void;
}
