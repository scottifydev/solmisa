import { create } from "zustand";
import type {
  StandardsLabState,
  PlaybackSettings,
  TuneMetadata,
} from "@/types/standards-lab";
import { fetchAndParseMidi } from "@/lib/midi/parser";
import { detectChords, quantizeChordsToBar } from "@/lib/midi/chord-detector";
import { buildNotation } from "@/lib/midi/quantizer";
import { STANDARDS_CATALOG } from "@/data/standards/catalog";

/** Increments on every load so a stale fetch can detect it lost the race. */
let loadToken = 0;

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
    await get().loadMidi(tune.midiUrl, tune.title, tune);
  },

  async loadMidi(url: string, title?: string, tune?: TuneMetadata) {
    // Every load gets a token. Only the newest one is allowed to write, so a
    // slow fetch that resolves after the user has picked another tune cannot
    // paint its score under the new title.
    const token = ++loadToken;
    const isCurrent = () => token === loadToken;

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
      if (!isCurrent()) return;

      // Trim to the first chorus before anything else reads the data, so the
      // score, the scrubber and playback all agree on where the tune ends.
      // Without this, audio keeps playing for minutes past the last drawn bar.
      // The tune is passed in rather than re-read from state, which used to
      // apply the newly selected tune's bar count to the old tune's notes.
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
        if (!isCurrent()) return;
        set({ detectedChords: chords, chordDetectionStatus: "ready" });

        const notation = buildNotation(parsed, chords, tune?.sections);
        set({ notation });
      } catch (err) {
        if (!isCurrent()) return;
        // Report it rather than leaving a titled page with no score and no
        // explanation, which is what a bare catch produced.
        console.error("Chord detection or notation failed:", err);
        set({
          chordDetectionStatus: "error",
          parseError: "Could not analyse this tune. Try another from the list.",
        });
      }
    } catch (err) {
      if (!isCurrent()) return;
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
