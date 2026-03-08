import { createClient } from "@/lib/supabase/server";
import type { SrsStageKey } from "@/types/srs";
import type { FlowStreamCard } from "./types";
import { selectModality } from "./modality-selector";

interface LinkWithState {
  chainSlug: string;
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
): Promise<FlowStreamCard | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Get active chains
  let progressQuery = supabase
    .from("user_chain_progress")
    .select(
      "chain_id, highest_unlocked_position, chain_definitions!inner(id, slug, name, root_key, total_links)",
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

  const selected = dueCards[0] ?? newCards[0] ?? practiceCards[0];
  if (!selected) return null;

  const modality = selectModality(
    {
      modalities: selected.modalities,
      modality_by_stage: selected.modalityByStage,
    },
    selected.srsStage,
  );

  return {
    userCardStateId: selected.userCardStateId,
    cardInstanceId: selected.cardInstanceId!,
    cardTemplateId: selected.cardTemplateId,
    promptRendered: selected.promptRendered ?? "",
    answerData: selected.answerData ?? {},
    optionsData: selected.optionsData,
    parameters: selected.parameters,
    feedback: selected.feedback,
    chainSlug: selected.chainSlug,
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
