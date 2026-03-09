export interface AudioNoteEvent {
  pitch: string; // "C4", "F#3", etc.
  duration: number; // in beats
  start: number; // in beats from beginning
}

export type AudioMode =
  | "scale_bare"
  | "scale_with_vamp"
  | "interval_melodic"
  | "interval_harmonic"
  | "interval_comparison"
  | "chord_arpeggiated"
  | "chord_blocked"
  | "degree_with_drone"
  | "degree_with_vamp"
  | "degree_fading_drone"
  | "melody_excerpt"
  | "chorale_satb"
  | "progression_block"
  | "rhythm_percussion";

export interface AudioConfig {
  mode: AudioMode;
  notes?: AudioNoteEvent[];
  voices?: Record<string, AudioNoteEvent[]>;
  root?: string;
  scaleType?: string;
  intervals?: number[];
  direction?: "ascending" | "descending" | "both";
  tempo?: number;
  vamp?: { chords: string[]; pattern: string };
  drone?: { pitch: string; fadeAfterBars?: number };
  excerpt?: {
    title: string;
    attribution: string;
    source: string;
  };
}
