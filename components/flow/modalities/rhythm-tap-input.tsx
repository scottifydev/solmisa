"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { brand } from "@/lib/tokens";
import { NotationView } from "@/components/notation/notation-view";
import type { NotationData } from "@/lib/notation/types";
import * as Tone from "tone";

interface RhythmTapInputProps {
  timeSignature: string;
  notes: { value: string; dot?: boolean; rest?: boolean }[];
  expectedBeats: number[]; // beat positions where taps should land (e.g. [0, 1, 2, 2.5, 3])
  tempo: number;
  toleranceMs?: number;
  onAnswer: (correct: boolean) => void;
}

type Phase = "ready" | "counting" | "tapping" | "result";

const CORRECT_THRESHOLD = 0.8;

function beatsToMs(beat: number, tempo: number): number {
  return (beat / tempo) * 60 * 1000;
}

export function RhythmTapInput({
  timeSignature,
  notes,
  expectedBeats,
  tempo,
  toleranceMs = 100,
  onAnswer,
}: RhythmTapInputProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const tapsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const countRef = useRef(0);

  const notationData: NotationData = {
    clef: "treble",
    key: "C",
    time: timeSignature,
    measures: [
      {
        notes: notes.map((n) => ({
          keys: ["b/4"],
          duration: n.value,
          dotted: n.dot,
          rest: n.rest,
        })),
      },
    ],
  };

  const startCountIn = useCallback(async () => {
    await Tone.start();
    setPhase("counting");
    tapsRef.current = [];

    const beatMs = beatsToMs(1, tempo);
    const beatsInMeasure = parseInt(timeSignature.split("/")[0]!, 10) || 4;

    // Play count-in clicks
    const metalSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.03, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 0.5,
      volume: -10,
    }).toDestination();

    const now = Tone.now() + 0.05;
    for (let i = 0; i < beatsInMeasure; i++) {
      metalSynth.triggerAttackRelease("16n", now + (i * beatMs) / 1000);
    }

    // After count-in, start tapping phase
    setTimeout(() => {
      metalSynth.dispose();
      setPhase("tapping");
      startTimeRef.current = performance.now();
    }, beatsInMeasure * beatMs);
  }, [tempo, timeSignature]);

  const handleTap = useCallback(() => {
    if (phase !== "tapping") return;

    const tapTime = performance.now() - startTimeRef.current;
    tapsRef.current.push(tapTime);

    // Check if we have enough taps
    if (tapsRef.current.length >= expectedBeats.length) {
      // Grade after a short delay
      setTimeout(() => gradePerformance(), 300);
    }
  }, [phase, expectedBeats.length]);

  const gradePerformance = useCallback(() => {
    const taps = tapsRef.current;
    const expectedMs = expectedBeats.map((b) => beatsToMs(b, tempo));

    let hits = 0;
    const usedTaps = new Set<number>();

    for (const expected of expectedMs) {
      let bestDiff = Infinity;
      let bestIdx = -1;

      for (let i = 0; i < taps.length; i++) {
        if (usedTaps.has(i)) continue;
        const diff = Math.abs(taps[i]! - expected);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0 && bestDiff <= toleranceMs) {
        hits++;
        usedTaps.add(bestIdx);
      }
    }

    const acc = expectedMs.length > 0 ? hits / expectedMs.length : 0;
    setAccuracy(Math.round(acc * 100));
    setHitCount(hits);
    setPhase("result");

    const correct = acc >= CORRECT_THRESHOLD;
    setTimeout(() => onAnswer(correct), correct ? 1200 : 2500);
  }, [expectedBeats, tempo, toleranceMs, onAnswer]);

  // Auto-timeout for tapping phase
  useEffect(() => {
    if (phase !== "tapping") return;

    const maxBeat = Math.max(...expectedBeats, 0);
    const timeoutMs = beatsToMs(maxBeat + 2, tempo); // 2 extra beats grace

    const timer = setTimeout(() => {
      if (phase === "tapping") gradePerformance();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [phase, expectedBeats, tempo, gradePerformance]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Notation */}
      <div className="w-full max-w-[400px]">
        <NotationView data={notationData} />
      </div>

      {/* Phase UI */}
      {phase === "ready" && (
        <button
          onClick={startCountIn}
          className="min-h-[48px] rounded-xl px-8 py-3 text-sm font-semibold transition-all"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Start
        </button>
      )}

      {phase === "counting" && (
        <p
          className="text-center text-lg font-semibold animate-pulse"
          style={{ color: brand.violet }}
        >
          Count in...
        </p>
      )}

      {phase === "tapping" && (
        <button
          onPointerDown={handleTap}
          className="w-full rounded-2xl py-16 text-lg font-semibold transition-colors active:scale-95"
          style={{
            backgroundColor: brand.graphite,
            border: `2px solid ${brand.violet}`,
            color: brand.violet,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          TAP
        </button>
      )}

      {phase === "result" && accuracy !== null && (
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-2xl font-bold"
            style={{
              color:
                accuracy >= CORRECT_THRESHOLD * 100
                  ? brand.correct
                  : brand.incorrect,
            }}
          >
            {accuracy}%
          </p>
          <p className="text-xs" style={{ color: brand.ash }}>
            {hitCount} of {expectedBeats.length} beats hit (within {toleranceMs}
            ms)
          </p>
        </div>
      )}
    </div>
  );
}
