"use server";

import { createClient } from "@/lib/supabase/server";
import { computeSchedule } from "@/lib/srs/scheduler";
import { stageToGroup } from "@/lib/srs/stages";
import type {
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewAnswerRequest,
  ReviewAnswerResponse,
  SrsStageGroup,
  SrsStageKey,
  CardCategory,
} from "@/types/srs";

export async function getReviewQueue(limit = 20): Promise<ReviewQueueResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const now = new Date().toISOString();

  // Fetch due cards across all tracks with template + track joins
  const { data: dueCards, count } = await supabase
    .from("user_card_state")
    .select(
      `
      id,
      card_instance_id,
      srs_stage,
      difficulty_tier,
      card_instances!inner (
        id,
        template_id,
        prompt_rendered,
        answer_data,
        options_data,
        card_templates!inner (
          card_category,
          response_type,
          playback,
          feedback,
          dimensions,
          lessons (
            track_id,
            skill_tracks (slug)
          )
        )
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", user.id)
    .neq("srs_stage", "mastered")
    .lte("next_review_at", now)
    .order("next_review_at")
    .limit(limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems: ReviewQueueItem[] = (dueCards ?? []).map((card: any) => {
    const instance = card.card_instances;
    const template = instance?.card_templates;
    const lesson = template?.lessons;
    const track = lesson?.skill_tracks;

    return {
      user_card_state_id: card.id,
      card_instance_id: card.card_instance_id,
      card_template_id: instance?.template_id ?? "",
      prompt_rendered: instance?.prompt_rendered ?? "",
      response_type: template?.response_type ?? "select_one",
      options_data: instance?.options_data ?? null,
      answer_data: instance?.answer_data ?? {},
      card_category: (template?.card_category ?? "declarative") as CardCategory,
      srs_stage: card.srs_stage as SrsStageKey,
      difficulty_tier: card.difficulty_tier,
      playback: template?.playback ?? null,
      feedback: template?.feedback ?? {
        correct: {
          text: "Correct!",
          show_answer: true,
          play_confirmation: false,
        },
        incorrect: {
          text: "Incorrect.",
          show_answer: true,
          play_correct: false,
          delay_ms: 1500,
        },
      },
      dimensions: template?.dimensions ?? [],
      track_slug: track?.slug ?? "unknown",
    };
  });

  // Blend: group perceptual cards by first dimension, interleave declarative/rhythm
  const perceptual = rawItems.filter((i) => i.card_category === "perceptual");
  const interleave = rawItems.filter((i) => i.card_category !== "perceptual");

  // Group perceptual cards by first dimension (skill group proxy)
  const perceptualGroups = new Map<string, ReviewQueueItem[]>();
  for (const item of perceptual) {
    const group = item.dimensions[0] ?? "general";
    const existing = perceptualGroups.get(group) ?? [];
    existing.push(item);
    perceptualGroups.set(group, existing);
  }

  // Build blended queue
  const items: ReviewQueueItem[] = [];
  const interleavePool = [...interleave];
  for (const group of perceptualGroups.values()) {
    items.push(...group);
    // Insert 1-2 interleave cards between perceptual groups
    if (interleavePool.length > 0) items.push(interleavePool.shift()!);
    if (interleavePool.length > 0) items.push(interleavePool.shift()!);
  }
  items.push(...interleavePool);

  // Stage breakdown
  const groupCounts: Record<SrsStageGroup, number> = {
    apprentice: 0,
    journeyman: 0,
    adept: 0,
    virtuoso: 0,
    mastered: 0,
  };
  for (const item of items) {
    groupCounts[stageToGroup(item.srs_stage)]++;
  }
  const stage_breakdown = (
    [
      "apprentice",
      "journeyman",
      "adept",
      "virtuoso",
      "mastered",
    ] as SrsStageGroup[]
  ).map((group) => ({ group, count: groupCounts[group] }));

  return {
    items,
    total_due: count ?? 0,
    session_size: items.length,
    stage_breakdown,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitReview(
  req: ReviewAnswerRequest,
): Promise<ReviewAnswerResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!UUID_RE.test(req.user_card_state_id))
    throw new Error("Invalid card state ID");

  // Get current card state
  const { data: cardState } = await supabase
    .from("user_card_state")
    .select("*, card_instances!inner(card_templates!inner(card_category))")
    .eq("id", req.user_card_state_id)
    .eq("user_id", user.id)
    .single();

  if (!cardState) throw new Error("Card state not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardCategory = ((cardState.card_instances as any)?.card_templates
    ?.card_category ?? "declarative") as CardCategory;

  // Compute new schedule
  const result = computeSchedule({
    item: {
      id: cardState.id,
      user_id: cardState.user_id,
      card_instance_id: cardState.card_instance_id,
      srs_stage: cardState.srs_stage as SrsStageKey,
      difficulty_tier: cardState.difficulty_tier,
      ease_factor: cardState.ease_factor,
      interval_days: cardState.interval_days,
      next_review_at: cardState.next_review_at,
      correct_streak: cardState.correct_streak,
      total_reviews: cardState.total_reviews,
      total_correct: cardState.total_correct,
      dimension_accuracy: cardState.dimension_accuracy,
      created_at: cardState.created_at,
      updated_at: cardState.updated_at,
    },
    card_category: cardCategory,
    correct: req.correct,
    response_time_ms: req.response_time_ms,
    session_accuracy: req.session_accuracy,
    confidence: req.confidence,
  });

  // Use RPC to atomically update state + create review record
  const { error: rpcError } = await supabase.rpc("process_review_answer", {
    p_user_card_state_id: req.user_card_state_id,
    p_response: {
      ...req.response,
      ...(req.confidence ? { confidence: req.confidence } : {}),
    },
    p_correct: req.correct,
    p_response_time_ms: req.response_time_ms,
    p_new_stage: result.new_stage,
    p_new_ease_factor: result.new_ease_factor,
    p_new_interval_days: result.new_interval_days,
    p_next_review_at: result.next_review_at,
    p_new_difficulty_tier: result.new_difficulty_tier,
  });
  if (rpcError) throw new Error("Failed to process review");

  return {
    new_stage: result.new_stage,
    new_interval_days: result.new_interval_days,
    next_review_at: result.next_review_at,
    stage_changed: result.new_stage !== cardState.srs_stage,
    tier_promoted: result.tier_promoted,
    new_difficulty_tier: result.tier_promoted
      ? result.new_difficulty_tier
      : undefined,
  };
}

export async function hasAnyCards(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from("user_card_state")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .limit(1);

  return (count ?? 0) > 0;
}

export interface DimensionAccuracy {
  dimension: string;
  total: number;
  correct: number;
  accuracy: number;
}

export async function getRadarDimensionAccuracy(): Promise<
  DimensionAccuracy[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Compute on read (Option A from spec): query review_records with radar_dimensions
  const { data: records } = await supabase
    .from("review_records")
    .select("correct, radar_dimensions, user_card_state!inner(user_id)")
    .eq("user_card_state.user_id", user.id);

  if (!records || records.length === 0) return [];

  const dimStats = new Map<string, { total: number; correct: number }>();

  for (const record of records) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dims = (record as any).radar_dimensions as string[] | null;
    if (!dims || dims.length === 0) continue;
    for (const dim of dims) {
      const stats = dimStats.get(dim) ?? { total: 0, correct: 0 };
      stats.total++;
      if (record.correct) stats.correct++;
      dimStats.set(dim, stats);
    }
  }

  return Array.from(dimStats.entries()).map(([dimension, stats]) => ({
    dimension,
    total: stats.total,
    correct: stats.correct,
    accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
  }));
}
