"use client";

import { useState, useCallback, useRef } from "react";
import { brand } from "@/lib/tokens";
import type { FlowStreamCard, UnlockResult } from "@/lib/chains/types";
import { getNextStreamCard, submitFlowAnswer } from "@/lib/actions/flow";
import { FlowCard } from "./flow-card";
import { ChainContextBar } from "./chain-context-bar";
import { FloatingStats } from "./floating-stats";
import { UnlockNotification } from "./unlock-notification";

type StreamPhase = "presenting" | "transitioning" | "unlock";

interface FlowStreamProps {
  initialCard: FlowStreamCard;
  focusChain?: string;
}

export function FlowStream({ initialCard, focusChain }: FlowStreamProps) {
  const [card, setCard] = useState<FlowStreamCard>(initialCard);
  const [phase, setPhase] = useState<StreamPhase>("presenting");
  const [pendingUnlock, setPendingUnlock] = useState<UnlockResult | null>(null);
  const [stats, setStats] = useState({ answered: 0, correct: 0, unlocks: 0 });
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadNextCard = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const next = await getNextStreamCard(focusChain);
      if (next) {
        setCard(next);
        setPhase("presenting");
      } else {
        setError("All caught up. No more cards due right now.");
      }
    } catch {
      setError("Failed to load next card.");
    }

    loadingRef.current = false;
  }, [focusChain]);

  const handleAnswer = useCallback(
    async (correct: boolean) => {
      if (!card.userCardStateId) {
        // Card without state (new) — just advance
        setStats((s) => ({
          answered: s.answered + 1,
          correct: s.correct + (correct ? 1 : 0),
          unlocks: s.unlocks,
        }));
        setPhase("transitioning");
        setTimeout(() => loadNextCard(), 600);
        return;
      }

      try {
        const result = await submitFlowAnswer({
          user_card_state_id: card.userCardStateId,
          correct,
          response_time_ms: 3000,
        });

        setStats((s) => ({
          answered: s.answered + 1,
          correct: s.correct + (correct ? 1 : 0),
          unlocks: s.unlocks + (result.unlockResult ? 1 : 0),
        }));

        if (result.unlockResult) {
          setPendingUnlock(result.unlockResult);
          setPhase("unlock");
        } else {
          setPhase("transitioning");
          setTimeout(() => loadNextCard(), 600);
        }
      } catch {
        setStats((s) => ({
          answered: s.answered + 1,
          correct: s.correct + (correct ? 1 : 0),
          unlocks: s.unlocks,
        }));
        setPhase("transitioning");
        setTimeout(() => loadNextCard(), 600);
      }
    },
    [card.userCardStateId, loadNextCard],
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

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Context bar */}
      <ChainContextBar
        chainName={card.chainName}
        linkPosition={card.linkPosition}
        totalLinks={card.totalLinks}
      />

      {/* Card content */}
      {phase === "presenting" && (
        <FlowCard card={card} onAnswer={handleAnswer} />
      )}

      {/* Transitioning */}
      {phase === "transitioning" && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet border-t-transparent" />
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

      {/* Floating stats */}
      {stats.answered > 0 && (
        <FloatingStats
          cardsAnswered={stats.answered}
          correctCount={stats.correct}
          unlocks={stats.unlocks}
        />
      )}
    </div>
  );
}
