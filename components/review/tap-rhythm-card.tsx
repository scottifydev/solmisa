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
const BEAT_FLASH_MS = 120;

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
  const [beatActive, setBeatActive] = useState(false);
  const [showMetronome, setShowMetronome] = useState(true);

  const tapStartRef = useRef(0);
  const answerStartRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTapRef = useRef(0);
  const beatTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  // Schedule visual beat flashes at given timestamps
  const scheduleBeats = useCallback((timestamps: number[]) => {
    // Clear any existing timers
    for (const t of beatTimersRef.current) clearTimeout(t);
    beatTimersRef.current = [];

    for (const ms of timestamps) {
      const onTimer = setTimeout(() => {
        setBeatActive(true);
      }, ms);
      const offTimer = setTimeout(() => {
        setBeatActive(false);
      }, ms + BEAT_FLASH_MS);
      beatTimersRef.current.push(onTimer, offTimer);
    }
  }, []);

  // Play audio clicks at given timestamps
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

  // Phase 1: Play the reference pattern with visual beats
  useEffect(() => {
    if (phase !== "listening") return;

    void playPattern(expectedMs);
    scheduleBeats(expectedMs);

    const timer = setTimeout(() => {
      setPhase("audiation");
    }, patternDurationMs);

    return () => {
      clearTimeout(timer);
      for (const t of beatTimersRef.current) clearTimeout(t);
    };
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
  // Also schedule visual reference beats during tapping
  useEffect(() => {
    if (phase !== "tapping") return;

    scheduleBeats(expectedMs);

    const timer = setTimeout(() => {
      finishTapping();
    }, patternDurationMs + 500);

    return () => {
      clearTimeout(timer);
      for (const t of beatTimersRef.current) clearTimeout(t);
    };
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

  // Button styling per phase
  const buttonClass =
    phase === "result"
      ? isCorrect
        ? "bg-correct/10 border-correct"
        : "bg-incorrect/10 border-incorrect"
      : tapActive
        ? "bg-violet/20 border-violet scale-[0.98]"
        : phase === "tapping"
          ? "bg-obsidian border-steel hover:border-silver active:bg-violet/20 active:border-violet"
          : "bg-obsidian border-steel opacity-70";

  return (
    <div className="bg-obsidian border border-steel rounded-lg p-6 max-w-[500px] w-full mx-auto">
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <SrsBadge stage={stageToGroup(card.srs_stage)} size="sm" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMetronome((v) => !v)}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
              showMetronome
                ? "text-violet bg-violet/10"
                : "text-ash hover:text-silver"
            }`}
            aria-label={
              showMetronome ? "Hide visual metronome" : "Show visual metronome"
            }
          >
            {showMetronome ? "VIS ON" : "VIS OFF"}
          </button>
          <span className="text-xs text-ash font-mono">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* Prompt */}
      <div className="font-body text-lg font-medium text-ivory leading-relaxed mb-4">
        {card.prompt_rendered}
      </div>

      {/* Visual metronome beat indicator */}
      {showMetronome && (phase === "listening" || phase === "tapping") && (
        <div className="flex justify-center mb-4">
          <div
            className={`w-4 h-4 rounded-full transition-all duration-75 ${
              beatActive
                ? "bg-violet scale-125 shadow-[0_0_12px_rgba(183,148,246,0.6)]"
                : "bg-steel/40 scale-100"
            }`}
          />
        </div>
      )}

      {/* Audiation progress bar */}
      {phase === "audiation" && (
        <div className="mb-4">
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

      {/* Always-visible tap button */}
      <div className="space-y-4">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            if (phase === "tapping") handleTap();
          }}
          disabled={phase !== "tapping"}
          className={`w-full py-16 rounded-xl border-2 transition-all select-none touch-none ${buttonClass}`}
        >
          <div className="text-center">
            {phase === "result" && result ? (
              <>
                <div
                  className={`text-4xl font-bold font-mono mb-1 ${
                    isCorrect ? "text-correct" : "text-incorrect"
                  }`}
                >
                  {accuracyPct}%
                </div>
                <div className="text-silver text-sm">
                  {result.hits}/{result.total} beats matched
                </div>
                <div
                  className={`text-sm font-medium mt-1 ${
                    isCorrect ? "text-correct" : "text-incorrect"
                  }`}
                >
                  {isCorrect ? "Good rhythm" : "Keep practicing"}
                </div>
              </>
            ) : (
              <>
                <div className="text-ivory text-2xl font-bold mb-1">
                  {phase === "listening"
                    ? "Listen..."
                    : phase === "audiation"
                      ? "Get ready..."
                      : "TAP"}
                </div>
                <div className="text-silver text-xs font-mono">
                  {phase === "listening"
                    ? "Pattern is playing"
                    : phase === "audiation"
                      ? "Audiate the rhythm"
                      : `${taps.length} taps`}
                </div>
              </>
            )}
          </div>
        </button>
        {phase === "tapping" && (
          <button
            onClick={finishTapping}
            className="w-full py-2 text-silver text-xs font-mono hover:text-ivory transition-colors"
          >
            Done tapping
          </button>
        )}
      </div>

      {/* Tolerance info for result */}
      {phase === "result" && (
        <div className="text-center mt-3 text-ash text-xs font-mono">
          Tolerance: {"\u00B1"}
          {tolerance}ms
        </div>
      )}
    </div>
  );
}
