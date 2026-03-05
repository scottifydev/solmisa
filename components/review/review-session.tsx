"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  ReviewQueueResponse,
  ReviewQueueItem,
  ReviewAnswerRequest,
} from "@/types/srs";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { submitReview } from "@/lib/actions/review";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import { ReviewCard } from "@/components/review/review-card";
import { TapRhythmCard } from "@/components/review/tap-rhythm-card";
import { SingSelfAssessCard } from "@/components/review/sing-self-assess-card";
import { PreSession } from "@/components/review/pre-session";
import {
  SessionSummary,
  type SessionResultItem,
} from "@/components/review/session-summary";
import { ProgressBar } from "@/components/ui/progress-bar";

// ─── Types ──────────────────────────────────────────────────

interface ReviewSessionProps {
  initialQueue: ReviewQueueResponse;
}

type SessionPhase = "pre_session" | "active" | "summary";

// ─── Constants ──────────────────────────────────────────────

const KEY_CHANGE_DELAY_MS = 200;
const DEFAULT_DRONE_KEY: NoteName = "C";

// ─── Main Review Session ────────────────────────────────────

export function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<SessionPhase>("pre_session");
  const [queue, setQueue] = useState<ReviewQueueItem[]>(initialQueue.items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResultItem[]>([]);
  const [changingKey, setChangingKey] = useState(false);
  const startTimeRef = useRef(0);

  const drone = useDrone();
  const playback = usePlayback();

  const currentCard = queue[currentIndex];
  const total = queue.length;

  // Determine the drone key for a given card (from template playback JSONB)
  const getCardKey = useCallback((card: ReviewQueueItem): NoteName => {
    return (card.playback?.drone_key as NoteName) ?? DEFAULT_DRONE_KEY;
  }, []);

  // Clean up drone on unmount or navigate away
  useEffect(() => {
    return () => {
      drone.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Start button — initializes audio with user gesture
  const handleStart = useCallback(
    async (limit?: number) => {
      // If user selected a smaller session size, trim the queue
      if (limit !== undefined && limit < queue.length) {
        setQueue((q) => q.slice(0, limit));
      }

      startTimeRef.current = Date.now();
      const firstCard = queue[0];
      if (firstCard) {
        const key = getCardKey(firstCard);
        await drone.start({ key, octave: 4 });
      }
      setPhase("active");
    },
    [queue, drone, getCardKey],
  );

  // Handle answer from ReviewCard
  const handleAnswer = useCallback(
    async (correct: boolean, responseTimeMs: number) => {
      if (!currentCard) return;

      // Build the request
      const req: ReviewAnswerRequest = {
        user_card_state_id: currentCard.user_card_state_id,
        response: { selected: true },
        correct,
        response_time_ms: responseTimeMs,
      };

      // Submit answer
      let stageChanged = false;
      let newStage = currentCard.srs_stage;
      try {
        const result = await submitReview(req);
        stageChanged = result.stage_changed;
        newStage = result.new_stage;
      } catch {
        // Don't block the session on network errors
      }

      setResults((prev) => [
        ...prev,
        {
          correct,
          stageChanged,
          stageBefore: currentCard.srs_stage,
          stageAfter: newStage,
          category: currentCard.card_category,
          track_slug: currentCard.track_slug,
        },
      ]);

      // Advance to next card or end session
      const nextIdx = currentIndex + 1;
      if (nextIdx >= total) {
        drone.stop();
        setPhase("summary");
        return;
      }

      // Handle key change if needed
      const nextCard = queue[nextIdx];
      if (nextCard) {
        const currentKey = getCardKey(currentCard);
        const nextKey = getCardKey(nextCard);
        if (nextKey !== currentKey) {
          setChangingKey(true);
          try {
            await drone.changeKey(nextKey);
            await new Promise((r) => setTimeout(r, KEY_CHANGE_DELAY_MS));
          } finally {
            setChangingKey(false);
          }
        }
      }

      setCurrentIndex(nextIdx);
    },
    [currentCard, currentIndex, queue, total, drone, getCardKey],
  );

  // Audio callbacks for ReviewCard
  const handlePlayCadence = useCallback(async () => {
    if (!currentCard) return;
    const key = getCardKey(currentCard);
    await drone.playCadence({ key });
  }, [currentCard, drone, getCardKey]);

  const handlePlayDegree = useCallback(
    (degree: number) => {
      if (!currentCard) return;
      const key = getCardKey(currentCard);
      void playback.playDegree({
        degree: degree as DiatonicDegree,
        key,
        octave: 4,
      });
    },
    [currentCard, playback, getCardKey],
  );

  const handlePlayResolution = useCallback(
    async (degree: number) => {
      if (!currentCard) return;
      const key = getCardKey(currentCard);
      await playback.playResolution({
        fromDegree: degree as DiatonicDegree,
        key,
      });
    },
    [currentCard, playback, getCardKey],
  );

  // ─── Render ─────────────────────────────────────────────────

  if (phase === "pre_session") {
    return (
      <PreSession
        queue={initialQueue}
        onStart={(limit) => void handleStart(limit)}
      />
    );
  }

  if (phase === "summary") {
    return (
      <SessionSummary results={results} startTime={startTimeRef.current} />
    );
  }

  // Active phase
  if (!currentCard) return null;

  const reviewed = results.length;
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              drone.stop();
              router.push("/dashboard");
            }}
            className="text-silver hover:text-ivory transition-colors text-sm"
          >
            &larr; Exit
          </button>
          <span className="text-silver text-sm font-mono">
            {currentIndex + 1} / {total}
          </span>
        </div>
        <ProgressBar value={currentIndex + 1} max={total} size="sm" />
      </div>

      {/* Key change indicator */}
      {changingKey && (
        <div className="text-center font-mono text-xs text-ash animate-pulse">
          Changing key...
        </div>
      )}

      {/* Review card */}
      {!changingKey && currentCard.response_type === "tap_rhythm" && (
        <TapRhythmCard
          key={currentCard.card_instance_id}
          card={currentCard}
          index={currentIndex}
          total={total}
          onAnswer={handleAnswer}
        />
      )}
      {!changingKey && currentCard.response_type === "sing_self_assess" && (
        <SingSelfAssessCard
          key={currentCard.card_instance_id}
          card={currentCard}
          index={currentIndex}
          total={total}
          onAnswer={handleAnswer}
          onPlayCadence={handlePlayCadence}
          onPlayDegree={handlePlayDegree}
        />
      )}
      {!changingKey &&
        currentCard.response_type !== "tap_rhythm" &&
        currentCard.response_type !== "sing_self_assess" && (
          <ReviewCard
            key={currentCard.card_instance_id}
            card={currentCard}
            index={currentIndex}
            total={total}
            onAnswer={handleAnswer}
            onPlayCadence={handlePlayCadence}
            onPlayDegree={handlePlayDegree}
            onPlayResolution={handlePlayResolution}
          />
        )}

      {/* Score tally */}
      <div className="flex justify-center gap-6 text-sm font-mono">
        <span className="text-correct">
          {"\u2713"} {correctCount}
        </span>
        <span className="text-incorrect">
          {"\u2717"} {reviewed - correctCount}
        </span>
      </div>
    </div>
  );
}
