import { createClient } from "@/lib/supabase/server";
import type { SrsStageKey } from "@/types/srs";
import type { FlowStreamCard } from "./types";
import { selectModality, selectClefForKeySig } from "./modality-selector";
import { stageToGroup } from "@/lib/srs/stages";

interface LinkWithState {
  chainSlug: string;
  chainTopic: string;
  chainName: string;
  chainRootKey: string;
  totalLinks: number;
  linkPosition: number;
  linkDescription: string;
  cardTemplateId: string;
  modalities: string[];
  modalityByStage: Record<string, string>;
  parameters: Record<string, unknown>;
  feedback: Record<string, unknown>;
  cardInstanceId: string | null;
  promptRendered: string | null;
  answerData: Record<string, unknown> | null;
  optionsData: Record<string, unknown>[] | null;
  userCardStateId: string | null;
  srsStage: SrsStageKey | null;
  nextReviewAt: string | null;
}

export async function getNextStreamCard(
  userId: string,
  focusChainSlug?: string | null,
  recentCardIds?: string[],
  lastChainSlug?: string | null,
  lastTopicSlug?: string | null,
): Promise<FlowStreamCard | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Get active chains
  let progressQuery = supabase
    .from("user_chain_progress")
    .select(
      "chain_id, highest_unlocked_position, chain_definitions!inner(id, slug, name, root_key, total_links, topic)",
    )
    .eq("user_id", userId)
    .eq("is_active", true);

  if (focusChainSlug) {
    progressQuery = progressQuery.eq("chain_definitions.slug", focusChainSlug);
  }

  const { data: activeChains } = await progressQuery;
  if (!activeChains || activeChains.length === 0) return null;

  const allLinks: LinkWithState[] = [];

  // 2. For each chain, get unlocked links with card data
  for (const progress of activeChains) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = progress.chain_definitions as any;

    const { data: links } = await supabase
      .from("chain_links")
      .select(
        "position, description, card_template_id, modalities, modality_by_stage, card_templates!inner(id, parameters, feedback)",
      )
      .eq("chain_id", chain.id)
      .lte("position", progress.highest_unlocked_position)
      .order("position");

    if (!links) continue;

    for (const link of links) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const template = link.card_templates as any;

      // Get card instance
      const { data: instance } = await supabase
        .from("card_instances")
        .select("id, prompt_rendered, answer_data, options_data")
        .eq("template_id", link.card_template_id)
        .limit(1)
        .maybeSingle();

      // Get user card state via card_instances join
      let userState: {
        id: string;
        srs_stage: string;
        next_review_at: string;
      } | null = null;

      if (instance) {
        const { data: stateData } = await supabase
          .from("user_card_state")
          .select("id, srs_stage, next_review_at")
          .eq("user_id", userId)
          .eq("card_instance_id", instance.id)
          .maybeSingle();
        userState = stateData;
      }

      allLinks.push({
        chainSlug: chain.slug,
        chainTopic: chain.topic ?? "",
        chainName: chain.name,
        chainRootKey: chain.root_key,
        totalLinks: chain.total_links,
        linkPosition: link.position,
        linkDescription: link.description ?? "",
        cardTemplateId: link.card_template_id,
        modalities: (link.modalities as string[]) ?? [],
        modalityByStage:
          (link.modality_by_stage as Record<string, string>) ?? {},
        parameters: (template?.parameters as Record<string, unknown>) ?? {},
        feedback: (template?.feedback as Record<string, unknown>) ?? {},
        cardInstanceId: instance?.id ?? null,
        promptRendered: instance?.prompt_rendered ?? null,
        answerData:
          (instance?.answer_data as Record<string, unknown> | null) ?? null,
        optionsData:
          (instance?.options_data as Record<string, unknown>[] | null) ?? null,
        userCardStateId: userState?.id ?? null,
        srsStage: (userState?.srs_stage as SrsStageKey) ?? null,
        nextReviewAt: userState?.next_review_at ?? null,
      });
    }
  }

  // 3. Partition into due, new, not-due
  const dueCards = allLinks.filter(
    (l) =>
      l.userCardStateId &&
      l.nextReviewAt &&
      l.nextReviewAt <= now &&
      l.srsStage !== "mastered",
  );

  const newCards = allLinks.filter(
    (l) => !l.userCardStateId && l.cardInstanceId,
  );

  // Practice cards: have state, not yet due, not mastered (fallback when pool is empty)
  const practiceCards = allLinks.filter(
    (l) =>
      l.userCardStateId &&
      l.nextReviewAt &&
      l.nextReviewAt > now &&
      l.srsStage !== "mastered",
  );

  // 4. Selection priority: due first (most overdue), then new (lowest position), then practice (soonest due)
  dueCards.sort((a, b) =>
    (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""),
  );
  newCards.sort((a, b) => a.linkPosition - b.linkPosition);
  practiceCards.sort((a, b) =>
    (a.nextReviewAt ?? "").localeCompare(b.nextReviewAt ?? ""),
  );

  // 5. Deprioritize recently-shown cards and same-chain cards for variety
  const recentSet = new Set(recentCardIds ?? []);
  const deprioritize = (cards: LinkWithState[]) => {
    if (recentSet.size === 0 && !lastChainSlug && !lastTopicSlug) return cards;
    // Prefer different topic first
    if (lastTopicSlug) {
      const diffTopicFresh = cards.filter(
        (c) =>
          c.chainTopic !== lastTopicSlug &&
          c.cardInstanceId &&
          !recentSet.has(c.cardInstanceId),
      );
      if (diffTopicFresh.length > 0) return diffTopicFresh;
      const diffTopic = cards.filter((c) => c.chainTopic !== lastTopicSlug);
      if (diffTopic.length > 0) return diffTopic;
    }
    // First prefer: different chain AND not recently shown
    if (lastChainSlug) {
      const diffChainFresh = cards.filter(
        (c) =>
          c.chainSlug !== lastChainSlug &&
          c.cardInstanceId &&
          !recentSet.has(c.cardInstanceId),
      );
      if (diffChainFresh.length > 0) return diffChainFresh;
      // Second prefer: different chain (even if recently shown)
      const diffChain = cards.filter((c) => c.chainSlug !== lastChainSlug);
      if (diffChain.length > 0) return diffChain;
    }
    // Third prefer: not recently shown (same chain OK)
    const fresh = cards.filter(
      (c) => c.cardInstanceId && !recentSet.has(c.cardInstanceId),
    );
    return fresh.length > 0 ? fresh : cards;
  };

  const selected =
    deprioritize(dueCards)[0] ??
    deprioritize(newCards)[0] ??
    deprioritize(practiceCards)[0] ??
    dueCards[0] ??
    newCards[0] ??
    practiceCards[0];
  if (!selected) return null;

  const modality = selectModality(
    {
      modalities: selected.modalities,
      modality_by_stage: selected.modalityByStage,
    },
    selected.srsStage,
  );

  // Clef override for key signature chains at adept+
  let parameters = selected.parameters;
  const isKeySigChain = selected.chainSlug.startsWith("key_");
  if (isKeySigChain && selected.srsStage) {
    const group = stageToGroup(selected.srsStage);
    if (group === "adept" || group === "virtuoso" || group === "mastered") {
      // Check Note Reading bass progress: any bass chain at position 3+
      const { data: bassProgress } = await supabase
        .from("user_chain_progress")
        .select("highest_unlocked_position, chain_definitions!inner(slug)")
        .eq("user_id", userId)
        .eq("is_active", true)
        .like("chain_definitions.slug", "note_bass_%")
        .gte("highest_unlocked_position", 3)
        .limit(1);

      const hasNoteReadingBass = !!bassProgress && bassProgress.length > 0;
      const clef = selectClefForKeySig(group, hasNoteReadingBass);
      if (clef) {
        parameters = { ...parameters, clef };
      }
    }
  }

  return {
    userCardStateId: selected.userCardStateId,
    cardInstanceId: selected.cardInstanceId!,
    cardTemplateId: selected.cardTemplateId,
    promptRendered: selected.promptRendered ?? "",
    answerData: selected.answerData ?? {},
    optionsData: selected.optionsData,
    parameters,
    feedback: selected.feedback,
    chainSlug: selected.chainSlug,
    chainTopic: selected.chainTopic ?? "",
    chainName: selected.chainName,
    chainRootKey: selected.chainRootKey,
    linkPosition: selected.linkPosition,
    totalLinks: selected.totalLinks,
    linkDescription: selected.linkDescription,
    modality,
    isNew: !selected.userCardStateId,
    srsStage: selected.srsStage,
  };
}

export async function checkForDueReview(
  userId: string,
): Promise<FlowStreamCard | null> {
  return getNextStreamCard(userId);
}
