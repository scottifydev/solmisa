import { create } from "zustand";
import type {
  StandardsLabState,
  PlaybackSettings,
} from "@/types/standards-lab";
import { fetchAndParseMidi } from "@/lib/midi/parser";
import { detectChords, quantizeChordsToBar } from "@/lib/midi/chord-detector";
import { buildNotation } from "@/lib/midi/quantizer";
import { STANDARDS_CATALOG } from "@/data/standards/catalog";

const DEFAULT_PLAYBACK_SETTINGS: PlaybackSettings = {
  tempo: 120,
  tempoRatio: 1.0,
  melodyMuted: false,
  harmonyMuted: false,
  melodyVolume: 0.8,
  harmonyVolume: 0.6,
  loop: false,
  loopRange: null,
  swing: 0.5,
};

export const useStandardsStore = create<StandardsLabState>()((set, get) => ({
  selectedTuneId: null,
  catalog: STANDARDS_CATALOG,

  parsedStandard: null,
  parseStatus: "idle",
  parseError: null,

  detectedChords: [],
  chordDetectionStatus: "idle",

  notation: null,
  currentBar: 0,

  playbackState: "stopped",
  playbackPosition: 0,
  playbackSettings: DEFAULT_PLAYBACK_SETTINGS,

  activeChordIndex: 0,

  async selectTune(tuneId: string) {
    const tune = get().catalog.find((t) => t.id === tuneId);
    if (!tune) return;

    set({ selectedTuneId: tuneId });
    await get().loadMidi(tune.midiUrl, tune.title);
  },

  async loadMidi(url: string, title?: string) {
    set({
      parseStatus: "loading",
      parseError: null,
      parsedStandard: null,
      detectedChords: [],
      chordDetectionStatus: "idle",
      notation: null,
      currentBar: 0,
      activeChordIndex: 0,
      playbackState: "stopped",
      playbackPosition: 0,
    });

    try {
      const full = await fetchAndParseMidi(url, title);

      // Trim to the first chorus before anything else reads the data, so the
      // score, the scrubber and playback all agree on where the tune ends.
      // Without this, audio keeps playing for minutes past the last drawn bar.
      const tune = get().catalog.find((t) => t.id === get().selectedTuneId);
      const maxBars = tune?.bars;
      const parsed =
        maxBars && full.totalBars > maxBars
          ? {
              ...full,
              totalBars: maxBars,
              // barStartTimes[maxBars] is the downbeat after the last kept bar,
              // which is exactly where the trimmed score ends.
              durationSeconds:
                full.barStartTimes[maxBars] ?? full.durationSeconds,
              barStartTimes: full.barStartTimes.slice(0, maxBars),
              tracks: {
                melody: full.tracks.melody.filter((n) => n.bar < maxBars),
                harmony: full.tracks.harmony.filter((n) => n.bar < maxBars),
              },
            }
          : full;

      set({ parsedStandard: parsed, parseStatus: "ready" });

      // Run chord detection
      set({ chordDetectionStatus: "running" });
      try {
        const rawChords = detectChords(parsed.tracks.harmony, parsed);
        const chords = quantizeChordsToBar(rawChords, parsed.totalBars);
        set({ detectedChords: chords, chordDetectionStatus: "ready" });

        const notation = buildNotation(parsed, chords, tune?.sections);
        set({ notation });
      } catch {
        set({ chordDetectionStatus: "error" });
      }
    } catch (err) {
      set({
        parseStatus: "error",
        parseError: err instanceof Error ? err.message : "Failed to parse MIDI",
      });
    }
  },

  setPlaybackState(state) {
    set({ playbackState: state });
  },

  setPlaybackPosition(time) {
    set({ playbackPosition: time });
  },

  setPlaybackSettings(partial) {
    set((s) => ({
      playbackSettings: { ...s.playbackSettings, ...partial },
    }));
  },

  setCurrentBar(bar) {
    set({ currentBar: bar });
  },

  setActiveChordIndex(index) {
    set({ activeChordIndex: index });
  },
}));
