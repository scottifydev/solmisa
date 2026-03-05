"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { DrillConfig } from "@/lib/actions/practice";
import { logDrillSession } from "@/lib/actions/practice";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import type { NoteName, ChordQuality } from "@/types/audio";
import { Button } from "@/components/ui/button";

// ─── Constants ──────────────────────────────────────────────

const ALL_KEYS: NoteName[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const ROMAN_NUMERALS = [
  { id: "I", label: "I", quality: "major" as ChordQuality, degree: 1 },
  { id: "ii", label: "ii", quality: "minor" as ChordQuality, degree: 2 },
  { id: "iii", label: "iii", quality: "minor" as ChordQuality, degree: 3 },
  { id: "IV", label: "IV", quality: "major" as ChordQuality, degree: 4 },
  { id: "V", label: "V", quality: "major" as ChordQuality, degree: 5 },
  { id: "vi", label: "vi", quality: "minor" as ChordQuality, degree: 6 },
  {
    id: "vii°",
    label: "vii\u00B0",
    quality: "diminished" as ChordQuality,
    degree: 7,
  },
];

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered =
    exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)] as T;
}

// ─── Types ──────────────────────────────────────────────────

type Phase = "listening" | "selecting" | "revealed";

interface ChordInfo {
  id: string;
  label: string;
  quality: ChordQuality;
  degree: number;
}

interface ChordProgressionDrillProps {
  drill: DrillConfig;
}

// ─── Component ──────────────────────────────────────────────

export function ChordProgressionDrill({ drill }: ChordProgressionDrillProps) {
  const router = useRouter();
  const droneHook = useDrone();
  const playback = usePlayback();

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("listening");
  const [currentKey, setCurrentKey] = useState<NoteName>("C");
  const [progression, setProgression] = useState<ChordInfo[]>([]);
  const [selected, setSelected] = useState<ChordInfo[]>([]);
  const [itemCount, setItemCount] = useState(0);

  const startTimeRef = useRef(0);
  const lastKeyRef = useRef<NoteName>("C");

  const config = drill.config as {
    progression_length?: number;
    chord_pool?: string[];
    keys?: NoteName[];
  };
  const progressionLength = config.progression_length ?? 4;
  const chordPool = config.chord_pool ?? ["I", "ii", "iii", "IV", "V", "vi"];
  const keys = config.keys ?? ALL_KEYS;

  const availableChords = useMemo(
    () => ROMAN_NUMERALS.filter((c) => chordPool.includes(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(chordPool)],
  );

  useEffect(() => {
    return () => {
      droneHook.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateProgression = useCallback((): ChordInfo[] => {
    const prog: ChordInfo[] = [];
    for (let i = 0; i < progressionLength; i++) {
      prog.push(pickRandom(availableChords));
    }
    return prog;
  }, [progressionLength, availableChords]);

  const playProgression = useCallback(
    async (prog: ChordInfo[], key: NoteName) => {
      for (const chord of prog) {
        // Use degree to compute root, then play chord with quality
        const DEGREE_TO_SEMITONE: Record<number, number> = {
          1: 0,
          2: 2,
          3: 4,
          4: 5,
          5: 7,
          6: 9,
          7: 11,
        };
        const NOTE_NAMES: NoteName[] = [
          "C",
          "C#",
          "D",
          "Eb",
          "E",
          "F",
          "F#",
          "G",
          "Ab",
          "A",
          "Bb",
          "B",
        ];
        const keyIndex = NOTE_NAMES.indexOf(key);
        const semitones = DEGREE_TO_SEMITONE[chord.degree] ?? 0;
        const rootIndex = (keyIndex + semitones) % 12;
        const root = NOTE_NAMES[rootIndex] as NoteName;

        await playback.playChord({
          quality: chord.quality,
          root,
          mode: "block",
          octave: 4,
          duration: 0.8,
        });
        await new Promise((r) => setTimeout(r, 300));
      }
    },
    [playback],
  );

  const startNewItem = useCallback(
    async (key: NoteName) => {
      const prog = generateProgression();
      setProgression(prog);
      setSelected([]);
      setPhase("listening");
      setCurrentKey(key);

      await droneHook.playCadence({ key });
      await new Promise((r) => setTimeout(r, 400));
      await playProgression(prog, key);
      setPhase("selecting");
    },
    [generateProgression, playProgression, droneHook],
  );

  const handleStart = useCallback(async () => {
    startTimeRef.current = Date.now();
    const firstKey = pickRandom(keys);
    lastKeyRef.current = firstKey;
    await droneHook.start({ key: firstKey, octave: 4 });
    setStarted(true);
    await startNewItem(firstKey);
  }, [keys, droneHook, startNewItem]);

  const handleChordSelect = useCallback(
    (chord: ChordInfo) => {
      if (phase !== "selecting") return;
      const next = [...selected, chord];
      setSelected(next);

      // Play the chord so user hears their selection
      const DEGREE_TO_SEMITONE: Record<number, number> = {
        1: 0,
        2: 2,
        3: 4,
        4: 5,
        5: 7,
        6: 9,
        7: 11,
      };
      const NOTE_NAMES: NoteName[] = [
        "C",
        "C#",
        "D",
        "Eb",
        "E",
        "F",
        "F#",
        "G",
        "Ab",
        "A",
        "Bb",
        "B",
      ];
      const keyIndex = NOTE_NAMES.indexOf(currentKey);
      const semitones = DEGREE_TO_SEMITONE[chord.degree] ?? 0;
      const rootIndex = (keyIndex + semitones) % 12;
      const root = NOTE_NAMES[rootIndex] as NoteName;

      void playback.playChord({
        quality: chord.quality,
        root,
        mode: "block",
        octave: 4,
        duration: 0.6,
      });

      if (next.length >= progressionLength) {
        setPhase("revealed");
        setItemCount((c) => c + 1);
      }
    },
    [phase, selected, progressionLength, currentKey, playback],
  );

  const handleReplay = useCallback(async () => {
    await playProgression(progression, currentKey);
  }, [progression, currentKey, playProgression]);

  const handleNext = useCallback(async () => {
    const newKey = pickRandom(keys, lastKeyRef.current);
    lastKeyRef.current = newKey;
    if (newKey !== currentKey) {
      await droneHook.changeKey(newKey);
    }
    await startNewItem(newKey);
  }, [keys, currentKey, droneHook, startNewItem]);

  const handleDone = useCallback(async () => {
    droneHook.stop();
    const durationMs = Date.now() - startTimeRef.current;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    try {
      await logDrillSession(drill.slug, durationMin, itemCount);
    } catch {
      // Analytics only
    }
    router.push("/practice");
  }, [droneHook, drill.slug, itemCount, router]);

  if (!started) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-6">
        <h1 className="font-display text-xl font-bold text-ivory">
          {drill.title}
        </h1>
        <p className="text-silver text-sm">
          Hear a chord progression, then identify each chord.
        </p>
        <div className="rounded-lg border border-violet/20 bg-violet/5 p-4">
          <p className="text-xs text-ash font-mono uppercase tracking-wider mb-1">
            Practice
          </p>
          <p className="text-sm text-silver">
            Nothing here affects your review scores or progress.
          </p>
        </div>
        <Button fullWidth onClick={() => void handleStart()}>
          Start Practice
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => router.push("/practice")}
        >
          Back to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => void handleDone()}
          className="text-silver hover:text-ivory transition-colors text-sm"
        >
          &larr; Done
        </button>
        <span className="text-[10px] font-mono text-ash uppercase tracking-wider">
          Practice
        </span>
        <span className="text-xs font-mono text-ash">{itemCount} played</span>
      </div>

      <p className="text-xs font-mono text-ash text-center">
        Key: {currentKey}
      </p>

      {/* Phase: Listening */}
      {phase === "listening" && (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[10, 16, 6, 14, 8, 12].map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-violet opacity-60"
                style={{
                  height: h,
                  animation: "wave 0.6s ease-in-out infinite alternate",
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
          <p className="text-silver text-sm font-mono">
            Listen to the progression...
          </p>
        </div>
      )}

      {/* Progress dots */}
      {phase !== "listening" && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: progressionLength }, (_, i) => {
            const sel = selected[i];
            const correct = progression[i];
            const isSelected = sel !== undefined;
            const isCorrect =
              phase === "revealed" && isSelected && sel.id === correct?.id;
            const isIncorrect =
              phase === "revealed" && isSelected && sel.id !== correct?.id;

            return (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono border transition-all ${
                  isCorrect
                    ? "bg-correct/20 border-correct text-correct"
                    : isIncorrect
                      ? "bg-incorrect/20 border-incorrect text-incorrect"
                      : isSelected
                        ? "bg-violet/20 border-violet text-violet"
                        : "bg-steel/30 border-steel text-ash"
                }`}
              >
                {isSelected ? sel.label : i + 1}
              </div>
            );
          })}
        </div>
      )}

      {/* Replay button */}
      {phase !== "listening" && (
        <div className="text-center">
          <button
            onClick={() => void handleReplay()}
            className="text-xs font-mono text-silver hover:text-ivory transition-colors"
          >
            Replay progression
          </button>
        </div>
      )}

      {/* Chord selection grid */}
      {phase === "selecting" && (
        <div className="grid grid-cols-4 gap-2">
          {availableChords.map((chord) => (
            <button
              key={chord.id}
              onClick={() => handleChordSelect(chord)}
              className="py-3 px-2 rounded-lg text-center font-mono text-sm transition-colors bg-steel/30 border border-steel hover:border-silver/50 text-ivory"
            >
              {chord.label}
            </button>
          ))}
        </div>
      )}

      {/* Revealed — show correct progression */}
      {phase === "revealed" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs font-mono text-ash mb-2">
              Correct progression:
            </p>
            <div className="flex justify-center gap-2">
              {progression.map((chord, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-lg bg-correct/10 border border-correct/40 flex items-center justify-center"
                >
                  <span className="text-correct font-mono text-sm font-bold">
                    {chord.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button fullWidth onClick={() => void handleNext()}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
