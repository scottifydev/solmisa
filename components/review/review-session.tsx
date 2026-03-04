"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  ReviewQueueResponse,
  ReviewQueueItem,
  ReviewAnswerRequest,
  SrsStageGroup,
} from "@/types/srs";
import type { NoteName, DiatonicDegree } from "@/types/audio";
import { submitReview } from "@/lib/actions/review";
import { useDrone } from "@/hooks/use-drone";
import { usePlayback } from "@/hooks/use-playback";
import { ReviewCard } from "@/components/review/review-card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { srsStageColors, semanticColors, colors } from "@/lib/tokens";
import { stageToGroup } from "@/lib/srs/stages";

// ─── Types ──────────────────────────────────────────────────

interface ReviewSessionProps {
  initialQueue: ReviewQueueResponse;
}

type SessionPhase = "pre_session" | "active" | "summary";

interface SessionResult {
  correct: boolean;
  stageChanged: boolean;
}

// ─── Constants ──────────────────────────────────────────────

const EST_SECONDS_PER_CARD = 12;
const KEY_CHANGE_DELAY_MS = 200;
const DEFAULT_DRONE_KEY: NoteName = "C";

// ─── Pre-Session Screen ─────────────────────────────────────

function PreSessionScreen({
  queue,
  onStart,
}: {
  queue: ReviewQueueResponse;
  onStart: () => void;
}) {
  const estMinutes = Math.max(1, Math.round((queue.total_due * EST_SECONDS_PER_CARD) / 60));

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Review Session
        </h1>
        <p className="text-silver text-sm font-body">
          {queue.total_due} card{queue.total_due !== 1 ? "s" : ""} due
          {" \u00B7 "}~{estMinutes} min
        </p>
      </div>

      {/* Stage breakdown */}
      <div className="rounded-lg border border-steel bg-obsidian p-4 space-y-3">
        <div className="text-[10px] tracking-[1.5px] uppercase text-ash font-mono">
          Stage Breakdown
        </div>
        <div className="space-y-2">
          {queue.stage_breakdown
            .filter((s) => s.count > 0)
            .map((s) => (
              <div key={s.group} className="flex items-center justify-between">
                <SrsBadge stage={s.group} size="sm" />
                <span className="text-sm text-ivory font-mono">{s.count}</span>
              </div>
            ))}
          {queue.stage_breakdown.every((s) => s.count === 0) && (
            <div className="text-sm text-ash text-center">No cards in queue</div>
          )}
        </div>
      </div>

      {/* Session size info */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Session" value={queue.session_size} sub={`of ${queue.total_due} due`} />
        <StatCard label="Est. Time" value={`${estMinutes}m`} sub="~12s/card" />
      </div>

      <Button fullWidth size="lg" onClick={onStart}>
        Start Review
      </Button>
    </div>
  );
}

// ─── Session Summary Screen ─────────────────────────────────

function SessionSummary({
  results,
  startTime,
}: {
  results: SessionResult[];
  startTime: number;
}) {
  const router = useRouter();
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const stageUps = results.filter((r) => r.stageChanged && r.correct).length;
  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedRemSec = elapsedSec % 60;
  const timeStr =
    elapsedMin > 0
      ? `${elapsedMin}m ${elapsedRemSec}s`
      : `${elapsedRemSec}s`;

  return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-6">
      <h1 className="font-display text-2xl font-bold text-ivory">
        Session Complete
      </h1>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Reviewed" value={total} />
        <StatCard
          label="Accuracy"
          value={`${accuracy}%`}
          color={accuracy >= 80 ? semanticColors.correct : accuracy >= 50 ? semanticColors.warning : semanticColors.incorrect}
        />
        <StatCard label="Correct" value={correct} color={colors.coral} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Time" value={timeStr} />
        <StatCard label="Stage Ups" value={stageUps} color={semanticColors.info} />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </Button>
        <Button fullWidth onClick={() => router.refresh()}>
          Review More
        </Button>
      </div>
    </div>
  );
}

// ─── Main Review Session ────────────────────────────────────

export function ReviewSession({ initialQueue }: ReviewSessionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<SessionPhase>("pre_session");
  const [queue] = useState<ReviewQueueItem[]>(initialQueue.items);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [changingKey, setChangingKey] = useState(false);
  const startTimeRef = useRef(0);
  const groupTrackerRef = useRef(new Map<string, { correct: number; total: number }>());

  const drone = useDrone();
  const playback = usePlayback();

  const currentCard = queue[currentIndex];
  const total = queue.length;

  // Determine the drone key for a given card
  const getCardKey = useCallback(
    (card: ReviewQueueItem): NoteName => {
      return (card.drone_key as NoteName) ??
        (card.playback?.drone_key as NoteName) ??
        DEFAULT_DRONE_KEY;
    },
    [],
  );

  // Clean up drone on unmount or navigate away
  useEffect(() => {
    return () => {
      drone.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Start button — initializes audio with user gesture
  const handleStart = useCallback(async () => {
    startTimeRef.current = Date.now();
    const firstCard = queue[0];
    if (firstCard) {
      const key = getCardKey(firstCard);
      await drone.start({ key, octave: 4 });
    }
    setPhase("active");
  }, [queue, drone, getCardKey]);

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

      // Track perceptual group accuracy
      if (currentCard.skill_group) {
        const tracker = groupTrackerRef.current;
        const group = tracker.get(currentCard.skill_group) ?? { correct: 0, total: 0 };
        group.total++;
        if (correct) group.correct++;
        tracker.set(currentCard.skill_group, group);

        // If last in group, attach session accuracy
        const nextItem = queue[currentIndex + 1];
        const isLastInGroup = !nextItem || nextItem.skill_group !== currentCard.skill_group;
        if (isLastInGroup && group.total > 0) {
          req.session_accuracy = group.correct / group.total;
        }
      }

      // Submit answer (fire-and-forget, don't block UI)
      let stageChanged = false;
      try {
        const result = await submitReview(req);
        stageChanged = result.stage_changed;
      } catch {
        // Don't block the session on network errors
      }

      setResults((prev) => [...prev, { correct, stageChanged }]);

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
          await drone.changeKey(nextKey);
          await new Promise((r) => setTimeout(r, KEY_CHANGE_DELAY_MS));
          setChangingKey(false);
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
    return <PreSessionScreen queue={initialQueue} onStart={() => void handleStart()} />;
  }

  if (phase === "summary") {
    return <SessionSummary results={results} startTime={startTimeRef.current} />;
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
      {!changingKey && (
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
        <span className="text-correct">{"\u2713"} {correctCount}</span>
        <span className="text-incorrect">{"\u2717"} {reviewed - correctCount}</span>
      </div>
    </div>
  );
}
