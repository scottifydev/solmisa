"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ReviewQueueItem, DifficultyTier } from "@/types/srs";
import { SrsBadge } from "@/components/ui/srs-badge";
import { brand } from "@/lib/tokens";
import { stageToGroup, getAudiationPauseMs } from "@/lib/srs/stages";

// ─── Types ──────────────────────────────────────────────────

interface TapRhythmCardProps {
  card: ReviewQueueItem;
  index: number;
  total: number;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
}

interface RhythmPattern {
  pattern: string;
  tempo: number;
}

// ─── Constants ──────────────────────────────────────────────

const TOLERANCE_BY_TIER: Record<DifficultyTier, number> = {
  intro: 150,
  core: 100,
  stretch: 60,
};

const CORRECT_THRESHOLD = 0.8;

// ─── Rhythm Pattern Parsing ─────────────────────────────────

const NOTE_DURATIONS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  "dotted-half": 3,
  "dotted-quarter": 1.5,
  "dotted-eighth": 0.75,
};

function parsePattern(patternStr: string): number[] {
  const tokens = patternStr.trim().split(/\s+/);
  const beats: number[] = [];
  let currentBeat = 0;
  for (const token of tokens) {
    if (token === "rest") {
      // Skip a quarter-note worth of rest
      currentBeat += 1;
      continue;
    }
    beats.push(currentBeat);
    const dur = NOTE_DURATIONS[token] ?? 1;
    currentBeat += dur;
  }
  return beats;
}

function beatsToTimestamps(beats: number[], tempo: number): number[] {
  const msPerBeat = 60000 / tempo;
  return beats.map((b) => b * msPerBeat);
}

// ─── Grading ────────────────────────────────────────────────

function gradeRhythm(
  expectedMs: number[],
  tapMs: number[],
  toleranceMs: number,
): { accuracy: number; hits: number; total: number } {
  const total = expectedMs.length;
  if (total === 0) return { accuracy: 1, hits: 0, total: 0 };

  let hits = 0;
  const usedTaps = new Set<number>();

  for (const expected of expectedMs) {
    let closestIdx = -1;
    let closestDist = Infinity;
    for (let i = 0; i < tapMs.length; i++) {
      if (usedTaps.has(i)) continue;
      const dist = Math.abs(tapMs[i]! - expected);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    if (closestIdx >= 0 && closestDist <= toleranceMs) {
      hits++;
      usedTaps.add(closestIdx);
    }
  }

  return { accuracy: hits / total, hits, total };
}

// ─── Component ──────────────────────────────────────────────

export function TapRhythmCard({
  card,
  index,
  total,
  onAnswer,
}: TapRhythmCardProps) {
  const [phase, setPhase] = useState<
    "listening" | "audiation" | "tapping" | "result"
  >("listening");
  const [audiationProgress, setAudiationProgress] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const [result, setResult] = useState<{
    accuracy: number;
    hits: number;
    total: number;
  } | null>(null);
  const [tapActive, setTapActive] = useState(false);

  const tapStartRef = useRef(0);
  const answerStartRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTapRef = useRef(0);

  // Extract pattern config from card
  const promptAudio = card.playback as unknown as RhythmPattern | null;
  const patternStr = promptAudio?.pattern ?? "quarter quarter quarter quarter";
  const tempo = promptAudio?.tempo ?? 100;
  const tolerance = TOLERANCE_BY_TIER[card.difficulty_tier] ?? 100;

  const expectedBeats = parsePattern(patternStr);
  const expectedMs = beatsToTimestamps(expectedBeats, tempo);
  const patternDurationMs =
    expectedMs.length > 0 ? expectedMs[expectedMs.length - 1]! + 1000 : 2000;

  // Get or create AudioContext for click sounds
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  }, []);

  // Play a click at given timestamps
  const playPattern = useCallback(
    async (timestamps: number[]) => {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") await ctx.resume();
      const now = ctx.currentTime;

      for (const ms of timestamps) {
        const time = now + ms / 1000;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    },
    [getAudioCtx],
  );

  // Play a single tap click
  const playTapClick = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio not available
    }
  }, [getAudioCtx]);

  // Phase 1: Play the reference pattern
  useEffect(() => {
    if (phase !== "listening") return;

    void playPattern(expectedMs);

    const timer = setTimeout(() => {
      setPhase("audiation");
    }, patternDurationMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase 2: Audiation pause (adaptive by SRS stage)
  useEffect(() => {
    if (phase !== "audiation") return;

    const pauseMs = getAudiationPauseMs(card.srs_stage);
    const start = Date.now();
    const interval = setInterval(() => {
      const pct = Math.min((Date.now() - start) / pauseMs, 1);
      setAudiationProgress(pct);
      if (pct >= 1) {
        clearInterval(interval);
        answerStartRef.current = Date.now();
        tapStartRef.current = Date.now();
        setPhase("tapping");
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, card.srs_stage]);

  // Phase 3: Auto-end tapping after pattern duration + buffer
  useEffect(() => {
    if (phase !== "tapping") return;

    const timer = setTimeout(() => {
      finishTapping();
    }, patternDurationMs + 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const finishTapping = useCallback(() => {
    if (phase !== "tapping") return;
    const tapTimestamps = taps;
    const gradeResult = gradeRhythm(expectedMs, tapTimestamps, tolerance);
    setResult(gradeResult);
    setPhase("result");

    const correct = gradeResult.accuracy >= CORRECT_THRESHOLD;
    const responseTimeMs = answerStartRef.current
      ? Date.now() - answerStartRef.current
      : 0;

    setTimeout(() => {
      onAnswer(correct, responseTimeMs);
    }, 1200);
  }, [phase, taps, expectedMs, tolerance, onAnswer]);

  // Handle tap input
  const handleTap = useCallback(() => {
    if (phase !== "tapping") return;

    const now = Date.now();
    if (now - lastTapRef.current < 30) return; // debounce
    lastTapRef.current = now;

    const elapsed = now - tapStartRef.current;
    setTaps((prev) => [...prev, elapsed]);
    playTapClick();

    // Visual feedback
    setTapActive(true);
    setTimeout(() => setTapActive(false), 100);
  }, [phase, playTapClick]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleTap]);

  const accuracyPct = result ? Math.round(result.accuracy * 100) : 0;
  const isCorrect = result ? result.accuracy >= CORRECT_THRESHOLD : false;

  return (
    <div className="bg-obsidian border border-steel rounded-lg p-6 max-w-[500px] w-full mx-auto">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <SrsBadge stage={stageToGroup(card.srs_stage)} size="sm" />
        <span className="text-xs text-ash font-mono">
          {index + 1}/{total}
        </span>
      </div>

      {/* Prompt */}
      <div className="font-body text-lg font-medium text-ivory leading-relaxed mb-6">
        {card.prompt_rendered}
      </div>

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
          <p className="text-silver text-sm font-mono">Listen to the pattern</p>
        </div>
      )}

      {/* Phase: Audiation pause */}
      {phase === "audiation" && (
        <div className="py-8">
          <div className="text-center font-mono text-xs text-ash mb-3">
            Listen... audiate...
          </div>
          <div className="w-full h-[2px] bg-steel rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-none"
              style={{
                width: `${audiationProgress * 100}%`,
                backgroundColor: brand.violet,
              }}
            />
          </div>
        </div>
      )}

      {/* Phase: Tapping */}
      {phase === "tapping" && (
        <div className="space-y-4">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTap();
            }}
            className={`w-full py-16 rounded-xl border-2 transition-all select-none touch-none ${
              tapActive
                ? "bg-violet/20 border-violet scale-[0.98]"
                : "bg-obsidian border-steel hover:border-silver active:bg-violet/20 active:border-violet"
            }`}
          >
            <div className="text-center">
              <div className="text-ivory text-2xl font-bold mb-1">TAP</div>
              <div className="text-silver text-xs font-mono">
                {taps.length} taps
              </div>
            </div>
          </button>
          <button
            onClick={finishTapping}
            className="w-full py-2 text-silver text-xs font-mono hover:text-ivory transition-colors"
          >
            Done tapping
          </button>
        </div>
      )}

      {/* Phase: Result */}
      {phase === "result" && result && (
        <div className="text-center py-6 space-y-3">
          <div
            className={`text-4xl font-bold font-mono ${
              isCorrect ? "text-correct" : "text-incorrect"
            }`}
          >
            {accuracyPct}%
          </div>
          <div className="text-silver text-sm">
            {result.hits}/{result.total} beats matched
          </div>
          <div
            className={`text-sm font-medium ${
              isCorrect ? "text-correct" : "text-incorrect"
            }`}
          >
            {isCorrect ? "Good rhythm" : "Keep practicing"}
          </div>
          <div className="text-ash text-xs font-mono">
            Tolerance: {"\u00B1"}
            {tolerance}ms
          </div>
        </div>
      )}
    </div>
  );
}
