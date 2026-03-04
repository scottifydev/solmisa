"use server";

import { createClient } from "@/lib/supabase/server";
import { schedule } from "@/lib/srs/engine";
import type { ReviewQueueItem, ReviewQueueResponse, ReviewAnswerRequest, ReviewAnswerResponse } from "@/types/srs";

export async function getReviewQueue(limit = 20): Promise<ReviewQueueResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();

  const { data: cards, count } = await supabase
    .from("srs_cards")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .lte("due_at", now)
    .order("due_at")
    .limit(limit);

  const items: ReviewQueueItem[] = (cards ?? []).map((card) => ({
    cardId: card.id,
    front: card.front,
    back: card.back,
    dueAt: card.due_at,
    interval: card.interval,
    easeFactor: card.ease_factor,
    stage: card.stage,
    cardCategory: card.card_category,
  }));

  return {
    items,
    totalDue: count ?? 0,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitReview(req: ReviewAnswerRequest): Promise<ReviewAnswerResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!UUID_RE.test(req.cardId)) throw new Error("Invalid card ID");
  if (!["correct", "incorrect", "skip"].includes(req.result)) throw new Error("Invalid result");
  if (req.responseTimeMs != null && (!Number.isFinite(req.responseTimeMs) || req.responseTimeMs < 0)) {
    throw new Error("Invalid response time");
  }

  // Get current card state
  const { data: card } = await supabase
    .from("srs_cards")
    .select("*")
    .eq("id", req.cardId)
    .eq("user_id", user.id)
    .single();

  if (!card) throw new Error("Card not found");

  // Run scheduling
  const result = schedule({
    currentInterval: card.interval,
    easeFactor: card.ease_factor,
    stage: card.stage,
    result: req.result,
    responseTimeMs: req.responseTimeMs,
  });

  // Update card and record review in parallel (independent writes)
  await Promise.all([
    supabase.from("srs_cards")
      .update({
        interval: result.newInterval,
        ease_factor: result.newEaseFactor,
        stage: result.newStage,
        due_at: result.nextDueAt.toISOString(),
      })
      .eq("id", req.cardId),
    supabase.from("srs_reviews").insert({
      card_id: req.cardId,
      user_id: user.id,
      result: req.result,
      response_time_ms: req.responseTimeMs,
    }),
  ]);

  return {
    newInterval: result.newInterval,
    newEaseFactor: result.newEaseFactor,
    newStage: result.newStage,
    nextDueAt: result.nextDueAt.toISOString(),
  };
}

export async function hasAnyCards(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from("srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .limit(1);

  return (count ?? 0) > 0;
}
