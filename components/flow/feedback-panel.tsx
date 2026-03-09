"use client";

import { useState, useEffect, useRef } from "react";
import { brand } from "@/lib/tokens";
import type { FlowStreamCard } from "@/lib/chains/types";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { FeedbackAudioControls } from "./feedback-audio-controls";
import { FeedbackWhy } from "./feedback-why";

type ConfidenceRating = "easy" | "good" | "hard" | "knew_it" | "blanked";

interface FeedbackPanelProps {
  card: FlowStreamCard;
  correct: boolean;
  missCount: number;
  wasRecovery: boolean;
  onAdvance: (confidence: ConfidenceRating) => void;
}

const CORRECT_DELAY_MS = 1500;
const INCORRECT_DELAY_MS = 3000;

export function FeedbackPanel({
  card,
  correct,
  missCount,
  wasRecovery,
  onAdvance,
}: FeedbackPanelProps) {
  const [selectedConfidence, setSelectedConfidence] =
    useState<ConfidenceRating | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancedRef = useRef(false);

  // At miss 2+, wait for user tap instead of auto-advancing
  const waitForTap = !correct && missCount >= 2;
  const delayMs = correct ? CORRECT_DELAY_MS : INCORRECT_DELAY_MS;

  // Auto-continue progress bar
  useEffect(() => {
    if (waitForTap) return;
    advancedRef.current = false;
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / delayMs, 1);
      setProgress(pct);
      if (pct >= 1 && !advancedRef.current) {
        advancedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        const defaultConfidence: ConfidenceRating = correct
          ? "good"
          : "blanked";
        onAdvance(selectedConfidence ?? defaultConfidence);
      }
    }, 30);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [correct, delayMs, waitForTap, onAdvance, selectedConfidence]);

  const handleTapAnywhere = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const defaultConfidence: ConfidenceRating = correct ? "good" : "blanked";
    onAdvance(selectedConfidence ?? defaultConfidence);
  };

  const handleConfidence = (rating: ConfidenceRating) => {
    setSelectedConfidence(rating);
  };

  const fb = card.feedback ?? {};
  const fbSide = (correct ? fb.correct : fb.incorrect) as
    | Record<string, unknown>
    | undefined;

  const isBreakthrough = correct && wasRecovery;
  const breakthroughText = isBreakthrough
    ? ((fbSide as Record<string, unknown> | undefined)?.breakthrough_text as
        | string
        | undefined)
    : undefined;

  const useRichText = !correct && missCount >= 1;
  const text = breakthroughText
    ? breakthroughText
    : useRichText && fbSide?.first_encounter_text
      ? (fbSide.first_encounter_text as string)
      : (fbSide?.text as string | undefined);

  const audioComparison = !correct
    ? (fbSide?.audio_comparison as
        | {
            highlight_degrees?: number[];
            correct_config: AudioConfig;
            selected_config?: AudioConfig;
            slow_tempo?: number;
          }
        | undefined)
    : undefined;

  const audioConfig = card.parameters?.audio_config as AudioConfig | undefined;
  const whyText = (fbSide?.why_text as string | undefined) ?? "";
  const showWhy = whyText && !correct && missCount >= 2;
  const showExploreLink = missCount >= 3;
  const topicSlug = card.chainSlug?.split("_")[0] ?? "";
  const isAural = !!audioConfig;
  const showAudio = isAural && (missCount >= 1 || correct);

  return (
    <div
      className="mt-3 space-y-3"
      onClick={waitForTap ? handleTapAnywhere : undefined}
      role={waitForTap ? "button" : undefined}
      tabIndex={waitForTap ? 0 : undefined}
    >
      {/* Feedback text */}
      {text && (
        <p
          className="text-center text-sm leading-relaxed"
          style={{
            color: isBreakthrough
              ? brand.violet
              : correct
                ? brand.correct
                : brand.ivory,
          }}
        >
          {text}
        </p>
      )}

      {/* Audio controls for ear training cards */}
      {showAudio && (
        <div className="flex justify-center">
          <FeedbackAudioControls
            audioConfig={audioConfig}
            audioComparison={audioComparison}
            autoPlay={!correct && missCount >= 2}
          />
        </div>
      )}

      {/* Why expansion */}
      {showWhy && (
        <FeedbackWhy
          whyText={whyText}
          topicSlug={topicSlug}
          showExploreLink={showExploreLink}
        />
      )}

      {/* Confidence pills */}
      <div className="flex justify-center gap-2 pt-1">
        {correct ? (
          <>
            {(["easy", "good", "hard"] as const).map((rating) => (
              <button
                key={rating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfidence(rating);
                }}
                className="rounded-lg px-3 py-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    selectedConfidence === rating
                      ? brand.violet + "30"
                      : brand.graphite,
                  border: `1px solid ${selectedConfidence === rating ? brand.violet : brand.steel}`,
                  color:
                    selectedConfidence === rating ? brand.violet : brand.silver,
                }}
              >
                {rating === "easy"
                  ? "Easy"
                  : rating === "good"
                    ? "Good"
                    : "Hard"}
              </button>
            ))}
          </>
        ) : (
          <>
            {(["knew_it", "blanked"] as const).map((rating) => (
              <button
                key={rating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfidence(rating);
                }}
                className="rounded-lg px-3 py-1 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    selectedConfidence === rating
                      ? brand.violet + "30"
                      : brand.graphite,
                  border: `1px solid ${selectedConfidence === rating ? brand.violet : brand.steel}`,
                  color:
                    selectedConfidence === rating ? brand.violet : brand.silver,
                }}
              >
                {rating === "knew_it" ? "Knew it" : "Blanked"}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Auto-continue progress bar */}
      {!waitForTap ? (
        <div
          className="mx-auto h-0.5 overflow-hidden rounded-full"
          style={{
            backgroundColor: brand.steel,
            maxWidth: "200px",
            cursor: "pointer",
          }}
          onClick={handleTapAnywhere}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: brand.violet,
              boxShadow: `0 0 6px 1px rgba(183,148,246,0.4)`,
              transition: "width 30ms linear",
            }}
          />
        </div>
      ) : (
        <p className="text-center text-xs" style={{ color: brand.silver }}>
          Tap to continue
        </p>
      )}
    </div>
  );
}
