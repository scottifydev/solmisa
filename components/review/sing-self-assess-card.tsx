"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ReviewQueueItem } from "@/types/srs";
import { SrsBadge } from "@/components/ui/srs-badge";
import { brand } from "@/lib/tokens";
import { stageToGroup } from "@/lib/srs/stages";

// ─── Types ──────────────────────────────────────────────────

interface SingSelfAssessCardProps {
  card: ReviewQueueItem;
  index: number;
  total: number;
  onAnswer: (correct: boolean, responseTimeMs: number) => void;
  onPlayCadence: () => Promise<void>;
  onPlayDegree: (degree: number) => void;
}

type SelfRating = "nailed_it" | "close" | "way_off";

type Phase = "cadence" | "target" | "singing" | "compare" | "rating" | "done";

// ─── Constants ──────────────────────────────────────────────

const SING_COUNTDOWN_MS = 4000;
const TARGET_LISTEN_MS = 1500;
const CADENCE_DURATION_MS = 2500;
const COMPARE_LISTEN_MS = 1500;
const DONE_DELAY_MS = 1000;

// ─── Component ──────────────────────────────────────────────

export function SingSelfAssessCard({
  card,
  index,
  total,
  onAnswer,
  onPlayCadence,
  onPlayDegree,
}: SingSelfAssessCardProps) {
  const [phase, setPhase] = useState<Phase>("cadence");
  const [countdown, setCountdown] = useState(SING_COUNTDOWN_MS / 1000);
  const [selectedRating, setSelectedRating] = useState<SelfRating | null>(null);
  const answerStartRef = useRef(0);

  const answerData = card.answer_data as {
    degree?: number;
    degree_label?: string;
  };
  const degree = answerData?.degree ?? 5;
  const degreeLabel = answerData?.degree_label ?? `Degree ${degree}`;

  // Phase 1: Play cadence to establish key
  useEffect(() => {
    if (phase !== "cadence") return;
    let cancelled = false;

    const run = async () => {
      await onPlayCadence();
      if (cancelled) return;
      // Brief pause after cadence finishes before playing target
      setTimeout(() => {
        if (!cancelled) setPhase("target");
      }, 400);
    };

    // Give the cadence some time to play through
    const timer = setTimeout(() => {
      if (!cancelled) setPhase("target");
    }, CADENCE_DURATION_MS);

    void run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase 2: Play the target degree
  useEffect(() => {
    if (phase !== "target") return;
    onPlayDegree(degree);

    const timer = setTimeout(() => {
      answerStartRef.current = Date.now();
      setPhase("singing");
    }, TARGET_LISTEN_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Phase 3: Singing countdown
  useEffect(() => {
    if (phase !== "singing") return;

    const start = Date.now();
    setCountdown(Math.ceil(SING_COUNTDOWN_MS / 1000));

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, SING_COUNTDOWN_MS - elapsed);
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        clearInterval(interval);
        setPhase("compare");
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 4: Replay target for comparison
  useEffect(() => {
    if (phase !== "compare") return;
    onPlayDegree(degree);

    const timer = setTimeout(() => {
      setPhase("rating");
    }, COMPARE_LISTEN_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Handle self-rating selection
  const handleRate = useCallback(
    (rating: SelfRating) => {
      if (phase !== "rating") return;
      setSelectedRating(rating);
      setPhase("done");

      const correct = rating !== "way_off";
      const responseTimeMs = answerStartRef.current
        ? Date.now() - answerStartRef.current
        : 0;

      setTimeout(() => {
        onAnswer(correct, responseTimeMs);
      }, DONE_DELAY_MS);
    },
    [phase, onAnswer],
  );

  const ratingConfig: { key: SelfRating; label: string; sub: string }[] = [
    { key: "nailed_it", label: "Nailed it", sub: "Matched the pitch" },
    { key: "close", label: "Close", sub: "Nearly there" },
    { key: "way_off", label: "Way off", sub: "Didn't match" },
  ];

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

      {/* Phase: Cadence */}
      {phase === "cadence" && (
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
          <p className="text-silver text-sm font-mono">Establishing key...</p>
        </div>
      )}

      {/* Phase: Target degree playing */}
      {phase === "target" && (
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
            Listen to {degreeLabel}
          </p>
        </div>
      )}

      {/* Phase: Singing countdown */}
      {phase === "singing" && (
        <div className="text-center py-8 space-y-4">
          <p className="text-ivory text-base font-body font-medium">
            Sing this degree out loud: {degreeLabel}
          </p>
          <p className="text-ash text-xs font-mono">
            Sing out loud, then rate yourself honestly
          </p>
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={brand.steel}
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={brand.violet}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / (SING_COUNTDOWN_MS / 1000))}`}
                className="transition-all duration-100"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-ivory text-2xl font-mono font-bold">
              {countdown}
            </span>
          </div>
        </div>
      )}

      {/* Phase: Compare — replaying target */}
      {phase === "compare" && (
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
            Compare — was your pitch accurate?
          </p>
        </div>
      )}

      {/* Phase: Self-rating */}
      {phase === "rating" && (
        <div className="space-y-3 py-4">
          <p className="text-ash text-xs font-mono text-center mb-4">
            How did you do?
          </p>
          {ratingConfig.map(({ key, label, sub }) => (
            <button
              key={key}
              onClick={() => handleRate(key)}
              className={`
                w-full py-4 px-5 rounded-lg border-[1.5px] text-left transition-all
                ${
                  key === "nailed_it"
                    ? "border-correct/40 hover:border-correct hover:bg-correct/5"
                    : key === "close"
                      ? "border-warning/40 hover:border-warning hover:bg-warning/5"
                      : "border-incorrect/40 hover:border-incorrect hover:bg-incorrect/5"
                }
              `}
            >
              <div className="font-body text-base font-semibold text-ivory">
                {label}
              </div>
              <div className="font-mono text-xs text-ash mt-0.5">{sub}</div>
            </button>
          ))}
        </div>
      )}

      {/* Phase: Done — brief feedback */}
      {phase === "done" && selectedRating && (
        <div className="text-center py-8 space-y-2">
          <div
            className={`text-2xl font-bold font-body ${
              selectedRating === "way_off" ? "text-incorrect" : "text-correct"
            }`}
          >
            {selectedRating === "nailed_it"
              ? "Nailed it"
              : selectedRating === "close"
                ? "Close"
                : "Way off"}
          </div>
          <p className="text-ash text-xs font-mono">
            {selectedRating === "way_off"
              ? "Keep at it — audiation builds with practice."
              : "Self-awareness strengthens your ear."}
          </p>
        </div>
      )}
    </div>
  );
}
