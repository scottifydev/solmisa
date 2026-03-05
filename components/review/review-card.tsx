"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReviewQueueItem, ConfidenceRating } from "@/types/srs";
import { SrsBadge } from "@/components/ui/srs-badge";
import { degreeColors, brand } from "@/lib/tokens";
import { stageToGroup } from "@/lib/srs/stages";
import { ConfidencePrompt } from "@/components/review/confidence-prompt";

// ─── Types ──────────────────────────────────────────────────

interface ReviewCardProps {
  card: ReviewQueueItem;
  index: number;
  total: number;
  onAnswer: (
    correct: boolean,
    responseTimeMs: number,
    confidence?: ConfidenceRating,
  ) => void;
  onPlayCadence?: () => Promise<void>;
  onPlayDegree?: (degree: number) => void;
  onPlayResolution?: (degree: number) => Promise<void>;
  showConfidence?: boolean;
}

interface OptionData {
  id: string;
  label: string;
  sublabel?: string;
  degree?: number;
}

// ─── Audiation Pause Durations ──────────────────────────────

const PERCEPTUAL_PAUSE_MS = 1500;
const RHYTHM_PAUSE_MS = 800;
const REVEAL_DELAY_PERCEPTUAL = 400; // after resolution
const REVEAL_DELAY_DECLARATIVE = 1000;
const REVEAL_DELAY_RHYTHM = 1000;

// ─── Waveform Animation (inline keyframes injected once) ────

const WAVEFORM_HEIGHTS = [10, 16, 6, 14, 8, 12];

function WaveformBars() {
  return (
    <div className="flex items-end gap-[2px] ml-auto">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-sm bg-violet opacity-60"
          style={{
            height: h,
            animation: `wave 0.6s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Audio Player Button ────────────────────────────────────

function AudioPlayerButton({
  playing,
  onPlay,
}: {
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      aria-label={playing ? "Audio playing" : "Replay audio"}
      className={`
        w-full py-3 px-4 mb-6 rounded-md border flex items-center gap-3 transition-all
        ${
          playing
            ? "bg-gradient-to-br from-violet/10 to-info/10 border-violet/40"
            : "bg-obsidian border-steel hover:border-silver"
        }
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${playing ? "bg-violet text-night" : "bg-graphite text-ivory"}
        `}
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="3" height="8" />
            <rect x="6" y="1" width="3" height="8" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <polygon points="0,0 10,6 0,12" />
          </svg>
        )}
      </div>
      <span
        className={`font-mono text-xs ${playing ? "text-violet" : "text-silver"}`}
      >
        {playing ? "Playing..." : "Replay"}
      </span>
      {playing && <WaveformBars />}
    </button>
  );
}

// ─── Degree Color Dot ───────────────────────────────────────

function DegreeDot({ degree }: { degree: number }) {
  const color = degreeColors[degree as keyof typeof degreeColors];
  if (!color) return null;
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-2 shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Main Review Card ───────────────────────────────────────

export function ReviewCard({
  card,
  index,
  total,
  onAnswer,
  onPlayCadence,
  onPlayDegree,
  onPlayResolution,
  showConfidence = true,
}: ReviewCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [waitingForConfidence, setWaitingForConfidence] = useState(false);
  const [audiationPaused, setAudiationPaused] = useState(false);
  const [audiationProgress, setAudiationProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [resolutionPlaying, setResolutionPlaying] = useState(false);
  const answerStartTime = useRef<number | null>(null);
  const cadencePlayed = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const options = (card.options_data as unknown as OptionData[]) ?? [];
  const correctAnswer = (card.answer_data as { correct_answer?: string })
    ?.correct_answer;
  const isPerceptual = card.card_category === "perceptual";
  const isRhythm = card.card_category === "rhythm";

  // Start audiation pause countdown
  const startAudiationPause = useCallback((durationMs: number) => {
    if (durationMs <= 0) {
      answerStartTime.current = Date.now();
      return;
    }
    setAudiationPaused(true);
    setAudiationProgress(0);
    const start = Date.now();
    pauseTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / durationMs, 1);
      setAudiationProgress(pct);
      if (pct >= 1) {
        clearInterval(pauseTimerRef.current);
        setAudiationPaused(false);
        answerStartTime.current = Date.now();
      }
    }, 30);
  }, []);

  // Auto-play on mount for perceptual/rhythm cards
  useEffect(() => {
    if (cadencePlayed.current) return;
    cadencePlayed.current = true;

    if (isPerceptual) {
      const playAudio = async () => {
        setPlaying(true);
        if (onPlayCadence) await onPlayCadence();
        // Find the degree from the correct answer
        const correctOpt = options.find((o) => o.id === correctAnswer);
        if (correctOpt?.degree && onPlayDegree) onPlayDegree(correctOpt.degree);
        setPlaying(false);
        startAudiationPause(PERCEPTUAL_PAUSE_MS);
      };
      void playAudio();
    } else if (isRhythm) {
      startAudiationPause(RHYTHM_PAUSE_MS);
    } else {
      // Declarative — immediately interactive
      answerStartTime.current = Date.now();
    }

    return () => clearInterval(pauseTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReplay = async () => {
    if (playing || revealed) return;
    setPlaying(true);
    if (onPlayCadence) await onPlayCadence();
    const correctOpt = options.find((o) => o.id === correctAnswer);
    if (correctOpt?.degree && onPlayDegree) onPlayDegree(correctOpt.degree);
    setPlaying(false);
  };

  const pendingAnswer = useRef<{
    isCorrect: boolean;
    responseTimeMs: number;
  } | null>(null);

  const handleSelect = (optionId: string) => {
    if (revealed || waitingForConfidence || audiationPaused) return;
    setSelected(optionId);
  };

  const revealAndSubmit = useCallback(
    async (
      isCorrect: boolean,
      responseTimeMs: number,
      confidence?: ConfidenceRating,
    ) => {
      setWaitingForConfidence(false);
      setRevealed(true);

      if (isPerceptual && onPlayResolution) {
        const correctOpt = options.find((o) => o.id === correctAnswer);
        if (correctOpt?.degree) {
          setResolutionPlaying(true);
          await onPlayResolution(correctOpt.degree);
          setResolutionPlaying(false);
        }
        setTimeout(
          () => onAnswer(isCorrect, responseTimeMs, confidence),
          REVEAL_DELAY_PERCEPTUAL,
        );
      } else if (isRhythm) {
        setTimeout(
          () => onAnswer(isCorrect, responseTimeMs, confidence),
          REVEAL_DELAY_RHYTHM,
        );
      } else {
        setTimeout(
          () => onAnswer(isCorrect, responseTimeMs, confidence),
          REVEAL_DELAY_DECLARATIVE,
        );
      }
    },
    [
      isPerceptual,
      isRhythm,
      onPlayResolution,
      options,
      correctAnswer,
      onAnswer,
    ],
  );

  const handleConfidence = useCallback(
    (confidence: ConfidenceRating) => {
      if (!pendingAnswer.current) return;
      const { isCorrect, responseTimeMs } = pendingAnswer.current;
      pendingAnswer.current = null;
      void revealAndSubmit(isCorrect, responseTimeMs, confidence);
    },
    [revealAndSubmit],
  );

  const handleCheck = async () => {
    if (!selected || revealed || waitingForConfidence) return;
    const isCorrect = selected === correctAnswer;
    const responseTimeMs = answerStartTime.current
      ? Date.now() - answerStartTime.current
      : 0;

    if (showConfidence) {
      pendingAnswer.current = { isCorrect, responseTimeMs };
      setWaitingForConfidence(true);
    } else {
      void revealAndSubmit(isCorrect, responseTimeMs);
    }
  };

  const getCardState = (optionId: string) => {
    if (audiationPaused) return "paused";
    if (!revealed) return selected === optionId ? "selected" : "default";
    if (optionId === correctAnswer) return "correct";
    if (optionId === selected && optionId !== correctAnswer) return "incorrect";
    return "dimmed";
  };

  const cardStateClasses: Record<string, string> = {
    default:
      "bg-obsidian border-ash text-ivory hover:border-silver cursor-pointer",
    paused: "bg-obsidian border-ash text-ivory opacity-50 cursor-not-allowed",
    selected:
      "bg-violet/10 border-violet text-ivory ring-1 ring-violet/30 cursor-pointer",
    correct: "bg-correct/10 border-correct text-correct",
    incorrect: "bg-incorrect/10 border-incorrect text-incorrect",
    dimmed: "border-steel/50 text-shadow",
  };

  return (
    <div className="bg-obsidian border border-steel rounded-lg p-6 max-w-[500px] w-full mx-auto">
      {/* Top row: SRS badge + counter */}
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

      {/* Audio player for perceptual cards */}
      {isPerceptual && (
        <AudioPlayerButton
          playing={playing}
          onPlay={() => void handleReplay()}
        />
      )}

      {/* Audiation pause indicator */}
      {audiationPaused && (
        <div className="mb-4">
          <div className="text-center font-mono text-xs text-ash mb-2">
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

      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const state = getCardState(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={audiationPaused || revealed}
              className={`
                rounded-md border-[1.5px] p-3 text-left font-body text-sm font-semibold
                transition-all flex items-center
                ${cardStateClasses[state] ?? cardStateClasses.default}
              `}
            >
              {opt.degree && <DegreeDot degree={opt.degree} />}
              <span>{opt.label}</span>
              {opt.sublabel && (
                <span className="ml-1 text-xs font-normal text-silver">
                  {opt.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Check button */}
      {!revealed && !waitingForConfidence && !audiationPaused && (
        <button
          onClick={() => void handleCheck()}
          disabled={!selected}
          className={`
            w-full mt-4 py-2 rounded-lg font-body font-medium text-base transition-colors
            ${
              selected
                ? "bg-violet text-white hover:bg-violet/90"
                : "bg-steel text-silver cursor-not-allowed"
            }
          `}
        >
          Check
        </button>
      )}

      {/* Confidence prompt */}
      {waitingForConfidence && (
        <div className="mt-4">
          <ConfidencePrompt onSelect={handleConfidence} />
        </div>
      )}

      {/* Resolution indicator */}
      {resolutionPlaying && (
        <div className="mt-3 text-center font-mono text-xs text-ash animate-pulse">
          Resolving to tonic...
        </div>
      )}
    </div>
  );
}
