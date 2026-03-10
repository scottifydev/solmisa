"use client";

import { useState, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import type { FlowStreamCard, UnlockResult } from "@/lib/chains/types";
import { getNextStreamCard, submitFlowAnswer } from "@/lib/actions/flow";
import { FlowCard } from "./flow-card";
import { FeedbackPanel } from "./feedback-panel";
import { DynamicsIndicator } from "./dynamics-indicator";
import { UnlockNotification } from "./unlock-notification";
import { ConductorSpinner } from "@/components/ui/conductor-spinner";
import { IntroScreen, getTopicIntro } from "./intro-screen";

type StreamPhase =
  | "intro"
  | "presenting"
  | "feedback"
  | "transitioning"
  | "unlock";

interface FlowStreamProps {
  initialCard: FlowStreamCard;
  focusChain?: string;
}

export function FlowStream({ initialCard, focusChain }: FlowStreamProps) {
  const [card, setCard] = useState<FlowStreamCard>(initialCard);
  const [phase, setPhase] = useState<StreamPhase>(() => {
    // Show intro for the very first card if it's new and link 1
    if (
      initialCard.isNew &&
      initialCard.linkPosition === 1 &&
      getTopicIntro(initialCard.chainSlug)
    ) {
      return "intro";
    }
    return "presenting";
  });
  const [pendingUnlock, setPendingUnlock] = useState<UnlockResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const introducedTopicsRef = useRef<Set<string>>(
    new Set(
      // If initial card shows intro, mark its topic as introduced
      initialCard.isNew && initialCard.linkPosition === 1
        ? [initialCard.chainSlug.split("_")[0]!]
        : [],
    ),
  );

  const [missCountMap, setMissCountMap] = useState<Map<string, number>>(
    new Map(),
  );
  const [lastBreakthrough, setLastBreakthrough] = useState(false);
  const [lastWasRecovery, setLastWasRecovery] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    correct: boolean;
    timeMs: number;
    wasRecovery: boolean;
  } | null>(null);

  // Store pending answer data for deferred submission
  const pendingAnswerRef = useRef<{
    userCardStateId: string;
    correct: boolean;
    missCount: number;
  } | null>(null);

  // Track recent card IDs to avoid repetition
  const recentCardIdsRef = useRef<string[]>([]);

  const loadNextCard = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const next = await getNextStreamCard(
        focusChain,
        recentCardIdsRef.current,
        card.chainSlug,
        card.chainTopic,
      );
      if (next) {
        // Track this card in recent list (keep last 5)
        recentCardIdsRef.current = [
          next.cardInstanceId,
          ...recentCardIdsRef.current,
        ].slice(0, 5);
        setCard(next);

        // Show intro for first encounter of a new topic (link 1 only)
        const topicPrefix = next.chainSlug.split("_")[0]!;
        if (
          next.isNew &&
          next.linkPosition === 1 &&
          !introducedTopicsRef.current.has(topicPrefix) &&
          getTopicIntro(next.chainSlug)
        ) {
          introducedTopicsRef.current.add(topicPrefix);
          setPhase("intro");
        } else {
          setPhase("presenting");
        }
      } else {
        setError("All caught up. No more cards due right now.");
      }
    } catch {
      setError("Failed to load next card.");
    }

    loadingRef.current = false;
  }, [focusChain]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      const cid = card.cardInstanceId;
      const prevMisses = missCountMap.get(cid) ?? 0;

      if (correct) {
        setLastBreakthrough(prevMisses >= 2);
        setLastWasRecovery(prevMisses > 0);
        setMissCountMap((m) => {
          const next = new Map(m);
          next.set(cid, 0);
          return next;
        });
      } else {
        setLastBreakthrough(false);
        setLastWasRecovery(false);
        setMissCountMap((m) => {
          const next = new Map(m);
          next.set(cid, prevMisses + 1);
          return next;
        });
      }

      const currentMissCount = correct ? 0 : prevMisses + 1;

      setLastCorrect(correct);
      if (correct) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
      setLastAnswerResult({
        correct,
        timeMs: 3000,
        wasRecovery: prevMisses > 0 && correct,
      });

      // Store pending answer for deferred submission (with confidence)
      if (card.userCardStateId) {
        pendingAnswerRef.current = {
          userCardStateId: card.userCardStateId,
          correct,
          missCount: currentMissCount,
        };
      } else {
        pendingAnswerRef.current = null;
      }

      setPhase("feedback");
    },
    [card.userCardStateId, card.cardInstanceId, missCountMap],
  );

  const handleAdvance = useCallback(
    async (confidence: "easy" | "good" | "hard" | "knew_it" | "blanked") => {
      // Submit the answer with confidence, then advance
      const pending = pendingAnswerRef.current;
      let unlockResult: UnlockResult | null = null;

      if (pending) {
        try {
          const result = await submitFlowAnswer({
            user_card_state_id: pending.userCardStateId,
            correct: pending.correct,
            response_time_ms: 3000,
            confidence,
            consecutiveMissCount: pending.missCount,
          });
          unlockResult = result.unlockResult;
        } catch {
          // Submission failed, continue without unlock
        }
        pendingAnswerRef.current = null;
      }

      if (unlockResult) {
        setPendingUnlock(unlockResult);
        setPhase("unlock");
      } else {
        setPhase("transitioning");
        setTimeout(() => loadNextCard(), 300);
      }
    },
    [loadNextCard],
  );

  const handleUnlockDismiss = useCallback(() => {
    setPendingUnlock(null);
    setPhase("transitioning");
    setTimeout(() => loadNextCard(), 300);
  }, [loadNextCard]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <p className="text-sm" style={{ color: brand.silver }}>
          {error}
        </p>
        <a
          href="/flow"
          className="inline-block rounded-xl px-6 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Back to Flow
        </a>
      </div>
    );
  }

  const topicIntro = getTopicIntro(card.chainSlug);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Intro screen for first-encounter topics */}
      {phase === "intro" && topicIntro && (
        <IntroScreen
          topicName={topicIntro.topicName}
          concept={topicIntro.concept}
          explanation={topicIntro.concept}
          example={topicIntro.example}
          onReady={() => setPhase("presenting")}
        />
      )}

      {/* Card content wrapped with dynamics */}
      {(phase === "presenting" || phase === "feedback") && (
        <DynamicsIndicator
          streak={streak}
          tempo={120}
          lastAnswerResult={lastAnswerResult}
        >
          <FlowCard
            card={card}
            onAnswer={handleAnswer}
            missCount={missCountMap.get(card.cardInstanceId) ?? 0}
            isBreakthrough={lastBreakthrough}
            wasRecovery={lastWasRecovery}
          />
        </DynamicsIndicator>
      )}

      {/* Feedback panel with auto-continue + confidence pills */}
      {phase === "feedback" && (
        <FeedbackPanel
          card={card}
          correct={lastCorrect}
          missCount={missCountMap.get(card.cardInstanceId) ?? 0}
          wasRecovery={lastWasRecovery}
          onAdvance={handleAdvance}
        />
      )}

      {/* Transitioning */}
      {phase === "transitioning" && (
        <div className="flex justify-center py-12">
          <ConductorSpinner pattern="2/4" bpm={160} size={28} />
        </div>
      )}

      {/* Unlock notification */}
      {phase === "unlock" && pendingUnlock && (
        <div className="py-6">
          <UnlockNotification
            unlock={pendingUnlock}
            onDismiss={handleUnlockDismiss}
          />
        </div>
      )}
    </div>
  );
}
