export interface DroneOptions {
  pitch: string;
  volume: number;
  waveform: OscillatorType;
}

export interface CadenceOptions {
  key: string;
  tempo: number;
  progression: string[];
}

export interface RandomKeyOptions {
  range: [string, string];
  excludeKeys?: string[];
}

export interface PlaybackOptions {
  tempo: number;
  loop: boolean;
  countdown: boolean;
}

export interface ResolutionOptions {
  targetDegree: number;
  key: string;
}

export type AudioState = "idle" | "playing" | "paused" | "loading" | "error";

export interface AudioPlayerProps {
  src: string;
  label?: string;
  sublabel?: string;
  variant?: "standalone" | "inline";
  onPlay?: () => void;
  onStop?: () => void;
}

export interface UseDroneReturn {
  start: (options: DroneOptions) => void;
  stop: () => void;
  isPlaying: boolean;
}

export interface UsePlaybackReturn {
  play: () => void;
  pause: () => void;
  stop: () => void;
  state: AudioState;
  currentTime: number;
  duration: number;
}
