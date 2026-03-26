import { create } from "zustand";
import type {
  StandardsLabState,
  PlaybackSettings,
} from "@/types/standards-lab";
import { fetchAndParseMidi } from "@/lib/midi/parser";
import { detectChords } from "@/lib/midi/chord-detector";
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
      const parsed = await fetchAndParseMidi(url, title);
      set({ parsedStandard: parsed, parseStatus: "ready" });

      // Run chord detection
      set({ chordDetectionStatus: "running" });
      try {
        const chords = detectChords(parsed.tracks.harmony, parsed);
        set({ detectedChords: chords, chordDetectionStatus: "ready" });

        // Build notation — limit to first chorus if tune has known bar count
        const tune = get().catalog.find((t) => t.id === get().selectedTuneId);
        const maxBars = tune?.bars;
        const trimmedParsed =
          maxBars && parsed.totalBars > maxBars
            ? {
                ...parsed,
                totalBars: maxBars,
                tracks: {
                  melody: parsed.tracks.melody.filter((n) => n.bar < maxBars),
                  harmony: parsed.tracks.harmony.filter((n) => n.bar < maxBars),
                },
              }
            : parsed;
        const trimmedChords = maxBars
          ? chords.filter((c) => c.bar < maxBars)
          : chords;
        const notation = buildNotation(
          trimmedParsed,
          trimmedChords,
          tune?.sections,
        );
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
