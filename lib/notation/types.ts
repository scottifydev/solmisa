export interface NotationData {
  clef: "treble" | "bass" | "alto" | "tenor";
  key: string;
  time?: string;
  measures: Measure[];
}

export interface Measure {
  notes: NoteData[];
}

export interface NoteData {
  keys: string[];
  duration: string;
  rest?: boolean;
  dotted?: boolean;
  accidental?: string;
  annotations?: {
    degree?: number;
    solfege?: string;
  };
}

export interface NoteEvent {
  keys: string[];
  duration: string;
  index: number;
  measureIndex: number;
  degree?: number;
  solfege?: string;
}
