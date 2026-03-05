"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { DrillConfig } from "@/lib/actions/practice";
import { logDrillSession } from "@/lib/actions/practice";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";

// ─── Constants ──────────────────────────────────────────────

const DEGREE_LABELS = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti"];
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

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered =
    exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)] as T;
}

// ─── Types ──────────────────────────────────────────────────

type Phase = "listening" | "selecting" | "revealed";

interface MelodicDictationDrillProps {
  drill: DrillConfig;
}

// ─── Component ──────────────────────────────────────────────

export function MelodicDictationDrill({ drill }: MelodicDictationDrillProps) {
  const router = useRouter();
  const droneHook = useDrone();
  const playback = usePlayback();

  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>("listening");
  const [currentKey, setCurrentKey] = useState<NoteName>("C");
  const [melody, setMelody] = useState<DiatonicDegree[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [itemCount, setItemCount] = useState(0);

  const startTimeRef = useRef(0);
  const lastKeyRef = useRef<NoteName>("C");

  const config = drill.config as {
    melody_length?: number;
    degree_pool?: number[];
    keys?: NoteName[];
  };
  const melodyLength = config.melody_length ?? 3;
  const degreePool = useMemo(
    () => (config.degree_pool ?? [1, 2, 3, 4, 5, 6, 7]) as DiatonicDegree[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(config.degree_pool)],
  );
  const keys = config.keys ?? ALL_KEYS;

  useEffect(() => {
    return () => {
      droneHook.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateMelody = useCallback((): DiatonicDegree[] => {
    const m: DiatonicDegree[] = [];
    for (let i = 0; i < melodyLength; i++) {
      m.push(pickRandom(degreePool));
    }
    return m;
  }, [melodyLength, degreePool]);

  const playMelody = useCallback(
    async (degrees: DiatonicDegree[], key: NoteName) => {
      await playback.playDegreeSequence(degrees, { key, octave: 4 });
    },
    [playback],
  );

  const startNewItem = useCallback(
    async (key: NoteName) => {
      const newMelody = generateMelody();
      setMelody(newMelody);
      setSelected([]);
      setPhase("listening");
      setCurrentKey(key);

      // Play cadence then melody
      await droneHook.playCadence({ key });
      await new Promise((r) => setTimeout(r, 400));
      await playMelody(newMelody, key);
      setPhase("selecting");
    },
    [generateMelody, playMelody, droneHook],
  );

  const handleStart = useCallback(async () => {
    startTimeRef.current = Date.now();
    const firstKey = pickRandom(keys);
    lastKeyRef.current = firstKey;
    await droneHook.start({ key: firstKey, octave: 4 });
    setStarted(true);
    await startNewItem(firstKey);
  }, [keys, droneHook, startNewItem]);

  const handleDegreeSelect = useCallback(
    (degree: number) => {
      if (phase !== "selecting") return;
      const next = [...selected, degree];
      setSelected(next);

      // Play the degree so user hears what they picked
      void playback.playDegree({
        degree: degree as DiatonicDegree,
        key: currentKey,
        octave: 4,
      });

      if (next.length >= melodyLength) {
        setPhase("revealed");
        setItemCount((c) => c + 1);
      }
    },
    [phase, selected, melodyLength, currentKey, playback],
  );

  const handleReplay = useCallback(async () => {
    await playMelody(melody, currentKey);
  }, [melody, currentKey, playMelody]);

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
          Hear a short melody, then select the degrees in order.
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
            Listen to the melody...
          </p>
        </div>
      )}

      {/* Progress dots */}
      {phase !== "listening" && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: melodyLength }, (_, i) => {
            const isSelected = i < selected.length;
            const isCorrect =
              phase === "revealed" && isSelected && selected[i] === melody[i];
            const isIncorrect =
              phase === "revealed" && isSelected && selected[i] !== melody[i];

            return (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border transition-all ${
                  isCorrect
                    ? "bg-correct/20 border-correct text-correct"
                    : isIncorrect
                      ? "bg-incorrect/20 border-incorrect text-incorrect"
                      : isSelected
                        ? "bg-violet/20 border-violet text-violet"
                        : "bg-steel/30 border-steel text-ash"
                }`}
              >
                {isSelected ? selected[i] : i + 1}
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
            Replay melody
          </button>
        </div>
      )}

      {/* Degree selection grid */}
      {phase === "selecting" && (
        <div className="grid grid-cols-4 gap-2">
          {DEGREE_LABELS.map((label, i) => {
            const degree = i + 1;
            return (
              <button
                key={degree}
                onClick={() => handleDegreeSelect(degree)}
                className="py-3 px-2 rounded-lg text-center font-mono text-sm transition-colors bg-steel/30 border border-steel hover:border-silver/50 text-ivory"
              >
                <div className="text-[10px] text-ash mb-0.5">{degree}</div>
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Revealed — show correct answer */}
      {phase === "revealed" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-xs font-mono text-ash mb-2">Correct melody:</p>
            <div className="flex justify-center gap-2">
              {melody.map((deg, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg bg-correct/10 border border-correct/40 flex items-center justify-center"
                >
                  <span className="text-correct font-mono text-sm font-bold">
                    {deg}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ash mt-2 font-mono">
              {melody.map((d) => DEGREE_LABELS[d - 1]).join(" — ")}
            </p>
          </div>

          <Button fullWidth onClick={() => void handleNext()}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
