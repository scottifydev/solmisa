"use server";

import { createClient } from "@/lib/supabase/server";
import { computeSchedule } from "@/lib/srs/scheduler";
import type { SrsStageKey, CardCategory } from "@/types/srs";
import type {
  FlowState,
  FlowStreamCard,
  FlowAnswerRequest,
} from "@/lib/chains/types";
import { getNextStreamCard as buildNextCard } from "@/lib/chains/stream-builder";
import { evaluateUnlocks } from "@/lib/chains/unlock-evaluator";
import {
  evaluateNeighborUnlocks,
  evaluateCrossTopicUnlocks,
  activateStarterChains,
} from "@/lib/chains/chain-activator";
import { UUID_RE } from "@/lib/utils/validation";
import type { UnlockResult } from "@/lib/chains/types";

export async function getFlowState(): Promise<FlowState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { chains: [], totalDue: 0, hasChains: false };

  const now = new Date().toISOString();

  const { data: progress } = await supabase
    .from("user_chain_progress")
    .select(
      "chain_id, highest_unlocked_position, completed_once, last_reviewed_at, is_active, chain_definitions!inner(slug, name, root_key, total_links)",
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (!progress || progress.length === 0)
    return { chains: [], totalDue: 0, hasChains: false };

  let totalDue = 0;
  const chains: FlowState["chains"] = [];

  for (const p of progress) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = p.chain_definitions as any;

    // Get all chain link template IDs
    const { data: links } = await supabase
      .from("chain_links")
      .select("card_template_id")
      .eq("chain_id", p.chain_id);

    const templateIds = (links ?? []).map(
      (l: { card_template_id: string }) => l.card_template_id,
    );

    // Count due cards for this chain
    let dueCount = 0;
    if (templateIds.length > 0) {
      const { data: instances } = await supabase
        .from("card_instances")
        .select("id")
        .in("template_id", templateIds);

      if (instances && instances.length > 0) {
        const instanceIds = instances.map((i: { id: string }) => i.id);
        const { count } = await supabase
          .from("user_card_state")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .neq("srs_stage", "mastered")
          .lte("next_review_at", now)
          .in("card_instance_id", instanceIds);
        dueCount = count ?? 0;
      }
    }

    totalDue += dueCount;

    chains.push({
      slug: chain.slug,
      name: chain.name,
      rootKey: chain.root_key,
      totalLinks: chain.total_links,
      highestUnlocked: p.highest_unlocked_position,
      dueCount,
      completedOnce: p.completed_once,
      lastReviewedAt: p.last_reviewed_at,
    });
  }

  return { chains, totalDue, hasChains: true };
}

export async function getNextStreamCard(
  focusChainSlug?: string,
  recentCardIds?: string[],
): Promise<FlowStreamCard | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return buildNextCard(user.id, focusChainSlug, recentCardIds);
}

export async function submitFlowAnswer(req: FlowAnswerRequest): Promise<{
  newStage: SrsStageKey;
  unlockResult: UnlockResult | null;
  neighborUnlocks: string[];
  crossTopicUnlocks: string[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!UUID_RE.test(req.user_card_state_id))
    throw new Error("Invalid card state ID");

  // Get current card state with template info
  const { data: cardState } = await supabase
    .from("user_card_state")
    .select(
      "*, card_instances!inner(id, template_id, card_templates!inner(card_category))",
    )
    .eq("id", req.user_card_state_id)
    .eq("user_id", user.id)
    .single();

  if (!cardState) throw new Error("Card state not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardInstance = cardState.card_instances as any;
  const cardCategory = (cardInstance?.card_templates?.card_category ??
    "declarative") as CardCategory;
  const cardTemplateId = cardInstance?.template_id as string;

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
    confidence: req.confidence === "hard" ? "guessing" : undefined,
  });

  // Enforce 48h back-off for repeated misses (4+ consecutive)
  let nextReviewAt = result.next_review_at;
  if ((req.consecutiveMissCount ?? 0) >= 4) {
    const minBackoff = new Date(Date.now() + 48 * 60 * 60 * 1000);
    if (new Date(nextReviewAt) < minBackoff) {
      nextReviewAt = minBackoff.toISOString();
    }
  }

  // Use RPC to atomically update state + create review record
  const { error: rpcError } = await supabase.rpc("process_review_answer", {
    p_user_card_state_id: req.user_card_state_id,
    p_response: { correct: req.correct },
    p_correct: req.correct,
    p_response_time_ms: req.response_time_ms,
    p_new_stage: result.new_stage,
    p_new_ease_factor: result.new_ease_factor,
    p_new_interval_days: result.new_interval_days,
    p_next_review_at: nextReviewAt,
    p_new_difficulty_tier: result.new_difficulty_tier,
  });
  if (rpcError) throw new Error("Failed to process review");

  // Evaluate chain unlocks
  let unlockResult: UnlockResult | null = null;
  let neighborUnlocks: string[] = [];
  let crossTopicUnlocks: string[] = [];

  if (cardTemplateId) {
    unlockResult = await evaluateUnlocks(
      user.id,
      cardTemplateId,
      result.new_stage,
    );

    if (unlockResult && unlockResult.newPosition >= 3) {
      neighborUnlocks = await evaluateNeighborUnlocks(
        user.id,
        unlockResult.chainSlug,
        unlockResult.newPosition,
      );
    }
  }

  // Find the chain for this card template (needed for progress stats + cross-topic)
  const { data: chainLink } = await supabase
    .from("chain_links")
    .select("chain_id")
    .eq("card_template_id", cardTemplateId)
    .limit(1)
    .maybeSingle();

  // Evaluate cross-topic unlocks when a link is unlocked
  if (unlockResult && chainLink) {
    const { data: chainDef } = await supabase
      .from("chain_definitions")
      .select("topic")
      .eq("id", chainLink.chain_id)
      .single();

    if (chainDef?.topic) {
      crossTopicUnlocks = await evaluateCrossTopicUnlocks(
        user.id,
        chainDef.topic,
        unlockResult.newPosition,
      );
    }
  }

  // Update chain progress stats
  if (chainLink) {
    const { data: currentProgress } = await supabase
      .from("user_chain_progress")
      .select("total_reviews")
      .eq("user_id", user.id)
      .eq("chain_id", chainLink.chain_id)
      .single();

    await supabase
      .from("user_chain_progress")
      .update({
        total_reviews: ((currentProgress?.total_reviews as number) ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("chain_id", chainLink.chain_id);
  }

  return {
    newStage: result.new_stage,
    unlockResult,
    neighborUnlocks,
    crossTopicUnlocks,
  };
}

export interface ChainMapLink {
  position: number;
  description: string;
  srsStage: SrsStageKey | null;
  isUnlocked: boolean;
}

export interface ChainMapData {
  chain: {
    name: string;
    slug: string;
    rootKey: string;
    totalLinks: number;
  };
  links: ChainMapLink[];
}

export async function getChainMapData(
  chainSlug: string,
): Promise<ChainMapData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Get chain definition
  const { data: chain } = await supabase
    .from("chain_definitions")
    .select("id, slug, name, root_key, total_links")
    .eq("slug", chainSlug)
    .single();

  if (!chain) return null;

  // Get user progress for this chain
  const { data: progress } = await supabase
    .from("user_chain_progress")
    .select("highest_unlocked_position")
    .eq("user_id", user.id)
    .eq("chain_id", chain.id)
    .maybeSingle();

  const highestUnlocked = progress?.highest_unlocked_position ?? 0;

  // Get all chain links with their card templates
  const { data: chainLinks } = await supabase
    .from("chain_links")
    .select("position, description, card_template_id")
    .eq("chain_id", chain.id)
    .order("position");

  if (!chainLinks) return null;

  // For each link, find the SRS stage via card_instances → user_card_state
  const links: ChainMapLink[] = [];

  for (const link of chainLinks) {
    const isUnlocked = link.position <= highestUnlocked;
    let srsStage: SrsStageKey | null = null;

    if (isUnlocked) {
      const { data: instance } = await supabase
        .from("card_instances")
        .select("id")
        .eq("template_id", link.card_template_id)
        .limit(1)
        .maybeSingle();

      if (instance) {
        const { data: cardState } = await supabase
          .from("user_card_state")
          .select("srs_stage")
          .eq("user_id", user.id)
          .eq("card_instance_id", instance.id)
          .maybeSingle();

        if (cardState) {
          srsStage = cardState.srs_stage as SrsStageKey;
        }
      }
    }

    links.push({
      position: link.position,
      description: link.description ?? `Link ${link.position}`,
      srsStage,
      isUnlocked,
    });
  }

  return {
    chain: {
      name: chain.name,
      slug: chain.slug,
      rootKey: chain.root_key,
      totalLinks: chain.total_links,
    },
    links,
  };
}

export async function activateFlow(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Idempotent — check if chains already active
  const { count } = await supabase
    .from("user_chain_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((count ?? 0) > 0) return 0;

  return activateStarterChains(user.id);
}
