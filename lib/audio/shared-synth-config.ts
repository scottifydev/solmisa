// Shared FM synth timbre config — used by both PlaybackEngine (degree notes)
// and DroneGenerator (cadence chords). Changing these values updates both.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PIANO_FM_TIMBRE: Record<string, any> = {
  harmonicity: 3,
  modulationIndex: 1.5,
  oscillator: { type: "sine" },
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.2 },
};

// Ear-training envelope: 2s active + 1s release ≈ 3s total audible time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DEGREE_SYNTH_OPTIONS: Record<string, any> = {
  ...PIANO_FM_TIMBRE,
  envelope: { attack: 0.01, decay: 0.8, sustain: 0.4, release: 1.0 },
  volume: 5,
};

// Block-chord envelope: crisp onset, short sustain, quick release
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CADENCE_SYNTH_OPTIONS: Record<string, any> = {
  ...PIANO_FM_TIMBRE,
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.15, release: 0.4 },
  volume: 0,
};
