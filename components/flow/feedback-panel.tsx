"use client";

import { brand } from "@/lib/tokens";
import type { FlowStreamCard } from "@/lib/chains/types";
import type { AudioConfig } from "@/lib/audio/audio-config-types";
import { FeedbackAudioControls } from "./feedback-audio-controls";
import { FeedbackWhy } from "./feedback-why";

interface FeedbackPanelProps {
  card: FlowStreamCard;
  correct: boolean;
  missCount: number;
  wasRecovery: boolean;
  onContinue: () => void;
}

export function FeedbackPanel({
  card,
  correct,
  missCount,
  wasRecovery,
  onContinue,
}: FeedbackPanelProps) {
  const fb = card.feedback ?? {};
  const fbSide = (correct ? fb.correct : fb.incorrect) as
    | Record<string, unknown>
    | undefined;

  // Escalation ladder per SCO-363:
  // miss 0: standard text
  // miss 1+: first_encounter_text (richer) + audio replay
  // miss 2+: auto-play comparison at slow_tempo, show "Why?"
  // miss 3+: "Why?" with "Explore" link

  // Breakthrough: correct after previous misses
  const isBreakthrough = correct && wasRecovery;
  const breakthroughText = isBreakthrough
    ? ((fbSide as Record<string, unknown> | undefined)?.breakthrough_text as
        | string
        | undefined)
    : undefined;

  // Determine feedback text
  const useRichText = !correct && missCount >= 1;
  const text = breakthroughText
    ? breakthroughText
    : useRichText && fbSide?.first_encounter_text
      ? (fbSide.first_encounter_text as string)
      : (fbSide?.text as string | undefined);

  // Audio comparison data (ear training cards, after incorrect answer)
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

  // Audio config from card parameters
  const audioConfig = card.parameters?.audio_config as AudioConfig | undefined;

  // Why text
  const whyText = (fbSide?.why_text as string | undefined) ?? "";

  // Show why: miss 2+ (with "Explore" link at miss 3+)
  const showWhy = whyText && !correct && missCount >= 2;
  const showExploreLink = missCount >= 3;

  // Topic slug for "Explore this topic" link
  const topicSlug = card.chainSlug?.split("_")[0] ?? "";

  // Determine if this is an aural card (has audio_config)
  const isAural = !!audioConfig;

  // Show audio controls: always for aural cards after miss 1+, or on correct for replay
  const showAudio = isAural && (missCount >= 1 || correct);

  return (
    <div className="mt-3 space-y-3">
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

      {/* Continue button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onContinue}
          className="rounded-xl px-8 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
