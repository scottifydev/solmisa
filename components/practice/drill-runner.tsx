"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DrillConfig } from "@/lib/actions/practice";
import { logDrillSession } from "@/lib/actions/practice";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { Button } from "@/components/ui/button";

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

interface DrillRunnerProps {
  drill: DrillConfig;
}

export function DrillRunner({ drill }: DrillRunnerProps) {
  const router = useRouter();
  const drone = useDrone();
  const playback = usePlayback();

  const [started, setStarted] = useState(false);
  const [currentKey, setCurrentKey] = useState<NoteName>("C");
  const [targetDegree, setTargetDegree] = useState<DiatonicDegree>(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const startTimeRef = useRef(0);
  const lastKeyRef = useRef<NoteName>("C");

  const keys = (drill.config.keys as NoteName[]) ?? ALL_KEYS;

  useEffect(() => {
    return () => {
      drone.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateNext = useCallback(() => {
    const newKey = pickRandom(keys, lastKeyRef.current);
    lastKeyRef.current = newKey;
    setCurrentKey(newKey);
    setTargetDegree(pickRandom([1, 2, 3, 4, 5, 6, 7] as DiatonicDegree[]));
    setSelected(null);
    setRevealed(false);
  }, [keys]);

  const handleStart = useCallback(async () => {
    startTimeRef.current = Date.now();
    const firstKey = pickRandom(keys);
    lastKeyRef.current = firstKey;
    setCurrentKey(firstKey);
    setTargetDegree(pickRandom([1, 2, 3, 4, 5, 6, 7] as DiatonicDegree[]));
    await drone.start({ key: firstKey, octave: 4 });
    setStarted(true);
  }, [keys, drone]);

  const handleSelect = useCallback(
    async (degree: number) => {
      if (revealed) return;
      setSelected(degree);
      setRevealed(true);
      setItemCount((c) => c + 1);

      // Play resolution to tonic after reveal
      await playback.playResolution({
        fromDegree: targetDegree,
        key: currentKey,
      });

      // Auto-advance after brief pause
      setTimeout(async () => {
        const newKey = pickRandom(keys, lastKeyRef.current);
        lastKeyRef.current = newKey;

        if (newKey !== currentKey) {
          await drone.changeKey(newKey);
        }

        setCurrentKey(newKey);
        setTargetDegree(pickRandom([1, 2, 3, 4, 5, 6, 7] as DiatonicDegree[]));
        setSelected(null);
        setRevealed(false);

        // Play the new target degree
        void playback.playDegree({
          degree: pickRandom([1, 2, 3, 4, 5, 6, 7] as DiatonicDegree[]),
          key: newKey,
          octave: 4,
        });
      }, 2000);
    },
    [revealed, targetDegree, currentKey, keys, drone, playback],
  );

  const handlePlayTarget = useCallback(() => {
    void playback.playDegree({
      degree: targetDegree,
      key: currentKey,
      octave: 4,
    });
  }, [targetDegree, currentKey, playback]);

  const handleDone = useCallback(async () => {
    drone.stop();
    const durationMs = Date.now() - startTimeRef.current;
    const durationMin = Math.max(1, Math.round(durationMs / 60000));
    try {
      await logDrillSession(drill.slug, durationMin, itemCount);
    } catch {
      // Analytics only — don't block exit
    }
    router.push("/practice");
  }, [drone, drill.slug, itemCount, router]);

  if (!started) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-6">
        <h1 className="font-display text-xl font-bold text-ivory">
          {drill.title}
        </h1>
        <p className="text-silver text-sm">
          Practice mode — no scores, no stakes. Exit anytime.
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

  // Active drill — degree recognition as default
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
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

      <div className="text-center space-y-4">
        <p className="text-xs font-mono text-ash">Key: {currentKey}</p>

        <button
          onClick={handlePlayTarget}
          className="mx-auto w-16 h-16 rounded-full bg-violet/20 border border-violet/40 flex items-center justify-center hover:bg-violet/30 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-violet ml-1"
          >
            <polygon points="5 3 19 12 5 21" />
          </svg>
        </button>
        <p className="text-xs text-silver">Tap to hear the note</p>
      </div>

      {/* Degree selection grid */}
      <div className="grid grid-cols-4 gap-2">
        {DEGREE_LABELS.map((label, i) => {
          const degree = i + 1;
          const isTarget = degree === targetDegree;
          const isSelected = degree === selected;

          let btnClass =
            "py-3 px-2 rounded-lg text-center font-mono text-sm transition-colors ";
          if (revealed && isTarget) {
            btnClass += "bg-correct/20 border border-correct text-correct";
          } else if (revealed && isSelected && !isTarget) {
            btnClass +=
              "bg-incorrect/20 border border-incorrect text-incorrect";
          } else if (!revealed) {
            btnClass +=
              "bg-steel/30 border border-steel hover:border-silver/50 text-ivory";
          } else {
            btnClass += "bg-steel/20 border border-steel/50 text-ash";
          }

          return (
            <button
              key={degree}
              onClick={() => void handleSelect(degree)}
              disabled={revealed}
              className={btnClass}
            >
              <div className="text-[10px] text-ash mb-0.5">{degree}</div>
              {label}
            </button>
          );
        })}
      </div>

      {revealed && (
        <p className="text-center text-sm text-silver animate-pulse">
          Next up...
        </p>
      )}
    </div>
  );
}
