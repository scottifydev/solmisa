"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioContext } from "@/components/audio-provider";
import type { RhythmEvent } from "@/types/lesson";
import { brand, semanticColors } from "@/lib/tokens";

// ─── Types ──────────────────────────────────────────────────

type Meter = "4/4" | "3/4" | "6/8" | "5/8" | "7/8";
type RhythmMode = "listen" | "tap" | "identify";

interface RhythmTapperProps {
  meter: Meter;
  bpm: number;
  targetPattern: RhythmEvent[];
  mode: RhythmMode;
  onComplete?: (accuracy: number) => void;
  showNotation?: boolean;
  countIn?: boolean;
}

interface TapMark {
  time: number;
  beatPosition: number;
  matched: boolean;
}

interface BeatResult {
  beat: number;
  hit: boolean;
  extra: boolean;
}

// ─── Constants ──────────────────────────────────────────────

const TAP_DEBOUNCE_MS = 30;
const TOLERANCE_BASE_MS = 80;
const TOLERANCE_FAST_MS = 50;
const FAST_BPM_THRESHOLD = 110;
const COUNT_IN_BARS = 1;

// ─── Beat Grid ──────────────────────────────────────────────

function getBeatsPerMeasure(meter: Meter): number {
  switch (meter) {
    case "4/4":
      return 4;
    case "3/4":
      return 3;
    case "6/8":
      return 6;
    case "5/8":
      return 5;
    case "7/8":
      return 7;
  }
}

function getMeasureCount(
  pattern: RhythmEvent[],
  beatsPerMeasure: number,
): number {
  if (pattern.length === 0) return 1;
  const lastEvent = pattern[pattern.length - 1]!;
  const lastBeatEnd = lastEvent.beat + lastEvent.duration;
  return Math.max(1, Math.ceil(lastBeatEnd / beatsPerMeasure));
}

// ─── Beat Marker Component ──────────────────────────────────

function BeatMarker({
  isActive,
  isAccent,
  isSubdivision,
  result,
  isTapped,
}: {
  isActive: boolean;
  isAccent: boolean;
  isSubdivision: boolean;
  result?: "correct" | "missed" | "extra" | null;
  isTapped: boolean;
}) {
  const size = isSubdivision ? 8 : isAccent ? 14 : 12;
  const borderWidth = isAccent ? 2 : 1.5;

  let fill = "transparent";
  let stroke = "#2e2e3e"; // steel
  let scale = 1;

  if (isActive) {
    fill = brand.violet;
    stroke = brand.violet;
    scale = 1.2;
  } else if (result === "correct") {
    fill = semanticColors.correct;
    stroke = semanticColors.correct;
  } else if (result === "missed") {
    fill = "transparent";
    stroke = semanticColors.incorrect;
  } else if (result === "extra") {
    fill = semanticColors.warning;
    stroke = semanticColors.warning;
  } else if (isTapped) {
    fill = brand.violet;
    stroke = brand.violet;
    scale = 1.1;
  }

  return (
    <div
      className="flex items-center justify-center transition-transform"
      style={{ transform: `scale(${scale})`, transitionDuration: "100ms" }}
    >
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          border:
            result === "missed"
              ? `${borderWidth}px dashed ${stroke}`
              : `${borderWidth}px solid ${stroke}`,
          backgroundColor: fill,
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export function RhythmTapper({
  meter,
  bpm,
  targetPattern,
  mode,
  onComplete,
  countIn = true,
}: RhythmTapperProps) {
  const { ensureStarted } = useAudioContext();

  const [phase, setPhase] = useState<
    "idle" | "counting" | "playing" | "recording" | "results"
  >("idle");
  const [activeBeat, setActiveBeat] = useState(-1);
  const [countInBeat, setCountInBeat] = useState(-1);
  const [taps, setTaps] = useState<TapMark[]>([]);
  const [beatResults, setBeatResults] = useState<BeatResult[]>([]);
  const [accuracy, setAccuracy] = useState(0);

  const tapsRef = useRef<TapMark[]>([]);
  const lastTapRef = useRef(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const finishRecordingRef = useRef<() => void>(() => {});

  const beatsPerMeasure = getBeatsPerMeasure(meter);
  const measureCount = getMeasureCount(targetPattern, beatsPerMeasure);
  const totalBeats = beatsPerMeasure * measureCount;
  const beatDurationMs = (60 / bpm) * 1000;
  const toleranceMs =
    bpm >= FAST_BPM_THRESHOLD ? TOLERANCE_FAST_MS : TOLERANCE_BASE_MS;

  // Build target beat positions for the pattern
  const targetBeats = targetPattern.filter((e) => !e.rest).map((e) => e.beat);

  // Get or create an AudioContext for clicks
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  // Play a click sound
  const playClick = useCallback(
    (isDownbeat: boolean) => {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = isDownbeat ? 1200 : 800;
      osc.type = "sine";
      gain.gain.setValueAtTime(isDownbeat ? 0.3 : 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    },
    [getAudioCtx],
  );

  // Play a sequence of beats with visual highlighting
  const playSequence = useCallback(
    (
      beats: number[],
      onBeat: (beatIdx: number) => void,
      onDone: () => void,
    ) => {
      let idx = 0;
      const tick = () => {
        if (idx >= beats.length) {
          onDone();
          return;
        }
        onBeat(idx);
        const beatNum = beats[idx]!;
        const isDownbeat = beatNum % beatsPerMeasure === 1 || beatNum === 1;
        // Check if this beat is in the target pattern
        const isTarget = targetBeats.includes(beatNum);
        if (isTarget || mode === "listen") {
          playClick(isDownbeat);
        }
        idx++;
        timerRef.current = setTimeout(tick, beatDurationMs);
      };
      tick();
    },
    [beatsPerMeasure, targetBeats, beatDurationMs, playClick, mode],
  );

  // Start the session
  const handleStart = useCallback(async () => {
    await ensureStarted();
    tapsRef.current = [];
    setTaps([]);
    setBeatResults([]);

    if (mode === "listen") {
      // Play the pattern with metronome
      setPhase("playing");
      const allBeats = Array.from({ length: totalBeats }, (_, i) => i + 1);
      playSequence(
        allBeats,
        (idx) => setActiveBeat(idx),
        () => {
          setActiveBeat(-1);
          setPhase("idle");
          onComplete?.(1);
        },
      );
      return;
    }

    if (mode === "tap") {
      if (countIn) {
        setPhase("counting");
        const countInBeats = Array.from(
          { length: beatsPerMeasure * COUNT_IN_BARS },
          (_, i) => i + 1,
        );
        let ci = 0;
        const countTick = () => {
          if (ci >= countInBeats.length) {
            setCountInBeat(-1);
            // Start recording
            setPhase("recording");
            startTimeRef.current = Date.now();
            // Schedule end of recording
            const recordDuration = totalBeats * beatDurationMs;
            timerRef.current = setTimeout(
              () => finishRecordingRef.current(),
              recordDuration,
            );
            return;
          }
          setCountInBeat(ci);
          playClick(ci === 0);
          ci++;
          timerRef.current = setTimeout(countTick, beatDurationMs);
        };
        countTick();
      } else {
        setPhase("recording");
        startTimeRef.current = Date.now();
        const recordDuration = totalBeats * beatDurationMs;
        timerRef.current = setTimeout(
          () => finishRecordingRef.current(),
          recordDuration,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    countIn,
    beatsPerMeasure,
    totalBeats,
    beatDurationMs,
    ensureStarted,
    playSequence,
    playClick,
  ]);

  // Handle tap input
  const handleTap = useCallback(() => {
    if (phase !== "recording") return;

    const now = Date.now();
    if (now - lastTapRef.current < TAP_DEBOUNCE_MS) return;
    lastTapRef.current = now;

    const elapsed = now - startTimeRef.current;
    const beatPosition = 1 + elapsed / beatDurationMs;

    const tap: TapMark = { time: elapsed, beatPosition, matched: false };
    tapsRef.current.push(tap);
    setTaps([...tapsRef.current]);
  }, [phase, beatDurationMs]);

  // Finish recording and compute results
  const finishRecording = useCallback(() => {
    setPhase("results");

    const userTaps = tapsRef.current;
    const results: BeatResult[] = [];
    const tapUsed = new Set<number>();

    // For each target beat, find closest user tap within tolerance
    for (const targetBeat of targetBeats) {
      const targetTimeMs = (targetBeat - 1) * beatDurationMs;
      let bestIdx = -1;
      let bestDelta = Infinity;

      for (let i = 0; i < userTaps.length; i++) {
        if (tapUsed.has(i)) continue;
        const delta = Math.abs(userTaps[i]!.time - targetTimeMs);
        if (delta < bestDelta && delta <= toleranceMs) {
          bestDelta = delta;
          bestIdx = i;
        }
      }

      if (bestIdx >= 0) {
        tapUsed.add(bestIdx);
        userTaps[bestIdx]!.matched = true;
        results.push({ beat: targetBeat, hit: true, extra: false });
      } else {
        results.push({ beat: targetBeat, hit: false, extra: false });
      }
    }

    // Mark unmatched taps as extra
    for (let i = 0; i < userTaps.length; i++) {
      if (!tapUsed.has(i)) {
        results.push({
          beat: userTaps[i]!.beatPosition,
          hit: false,
          extra: true,
        });
      }
    }

    const hits = results.filter((r) => r.hit).length;
    const total = targetBeats.length;
    const acc = total > 0 ? hits / total : 1;

    setBeatResults(results);
    setAccuracy(acc);
    setTaps([...userTaps]);
    onComplete?.(acc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBeats, beatDurationMs, toleranceMs]);

  finishRecordingRef.current = finishRecording;

  // Keyboard handler for spacebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && phase === "recording") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleTap]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Build beat grid display
  const beatGrid = Array.from({ length: totalBeats }, (_, i) => {
    const beatNum = i + 1;
    const isTarget = targetBeats.includes(beatNum);
    const isAccent = beatNum % beatsPerMeasure === 1;
    const isActive = activeBeat === i;

    // Get result for this beat
    let result: "correct" | "missed" | "extra" | null = null;
    if (phase === "results") {
      const br = beatResults.find(
        (r) => Math.round(r.beat) === beatNum && !r.extra,
      );
      if (br) {
        result = br.hit ? "correct" : "missed";
      }
    }

    // Check if user tapped near this beat
    const isTapped =
      phase === "recording" &&
      taps.some((t) => Math.abs(t.beatPosition - beatNum) < 0.4);

    return {
      beatNum,
      isTarget,
      isAccent,
      isActive,
      result,
      isTapped,
      isMeasureStart: beatNum > 1 && (beatNum - 1) % beatsPerMeasure === 0,
    };
  });

  const isIdle = phase === "idle" || phase === "results";
  const accPct = Math.round(accuracy * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] px-2 py-[3px] rounded-sm font-mono bg-correct/10 text-correct border border-correct/30">
          {meter}
        </span>
        <span className="text-silver text-sm font-mono">{bpm} BPM</span>
        {phase === "counting" && (
          <span className="text-violet text-sm font-mono animate-pulse">
            Count in... {countInBeat + 1}
          </span>
        )}
        {phase === "recording" && (
          <span className="text-violet text-sm font-mono animate-pulse">
            Tap!
          </span>
        )}
      </div>

      {/* Beat Grid */}
      <div
        className="bg-slate border border-steel rounded-lg px-5 py-4 select-none"
        onClick={phase === "recording" ? handleTap : undefined}
        role={phase === "recording" ? "button" : undefined}
        tabIndex={phase === "recording" ? 0 : undefined}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {beatGrid.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Measure bar line */}
              {b.isMeasureStart && <div className="w-px h-6 bg-steel/60" />}
              <div className="flex flex-col items-center gap-1">
                <BeatMarker
                  isActive={b.isActive}
                  isAccent={b.isAccent}
                  isSubdivision={false}
                  result={b.isTarget ? b.result : null}
                  isTapped={b.isTapped}
                />
                {/* Beat number label */}
                <span className="text-[8px] font-mono text-ash">
                  {b.beatNum}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tap instruction */}
        {phase === "recording" && (
          <div className="text-center text-ash text-xs font-mono mt-3">
            Tap here or press Space
          </div>
        )}
      </div>

      {/* Results */}
      {phase === "results" && (
        <div className="bg-obsidian border border-steel rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-ivory text-sm font-body">Accuracy</span>
            <span
              className="text-lg font-bold font-mono"
              style={{
                color:
                  accPct >= 80
                    ? semanticColors.correct
                    : accPct >= 60
                      ? semanticColors.warning
                      : semanticColors.incorrect,
              }}
            >
              {accPct}%
            </span>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-correct">
              {beatResults.filter((r) => r.hit).length} hits
            </span>
            <span className="text-incorrect">
              {beatResults.filter((r) => !r.hit && !r.extra).length} missed
            </span>
            <span className="text-warning">
              {beatResults.filter((r) => r.extra).length} extra
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {isIdle && (
          <button
            onClick={() => void handleStart()}
            className="flex-1 py-2 rounded-lg font-body font-medium text-sm bg-violet text-white hover:bg-violet/90 transition-colors"
          >
            {phase === "results"
              ? "Retry"
              : mode === "listen"
                ? "Play"
                : "Start"}
          </button>
        )}
      </div>
    </div>
  );
}
