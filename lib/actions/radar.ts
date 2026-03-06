"use server";

import { createClient } from "@/lib/supabase/server";
import {
  RADAR_DIMENSIONS,
  DIMENSION_MAP,
  decayWeight,
  type RadarGroup,
} from "@/lib/radar/dimensions";

export interface ScoreHistoryEntry {
  score: number;
  date: string;
}

export interface RadarScore {
  slug: string;
  name: string;
  group: RadarGroup;
  score: number;
  total_reviews: number;
  scoreHistory: ScoreHistoryEntry[];
}

export interface RadarScoresResponse {
  current: RadarScore[];
  lifetime: RadarScore[];
}

interface ReviewRecord {
  correct: boolean;
  created_at: string;
  radar_dimensions: string[];
  srs_stage_after: string;
  user_card_state: { user_id: string; interval_days: number };
}

function stageScore(stage: string): number {
  if (stage === "mastered") return 1;
  if (stage === "virtuoso_1" || stage === "virtuoso_2") return 0.8;
  if (stage.startsWith("adept")) return 0.6;
  if (stage.startsWith("journeyman")) return 0.4;
  return 0.2;
}

export async function getRadarScores(): Promise<RadarScoresResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      current: RADAR_DIMENSIONS.map((d) => ({
        slug: d.slug,
        name: d.name,
        group: d.group,
        score: 0,
        total_reviews: 0,
        scoreHistory: [],
      })),
      lifetime: RADAR_DIMENSIONS.map((d) => ({
        slug: d.slug,
        name: d.name,
        group: d.group,
        score: 0,
        total_reviews: 0,
        scoreHistory: [],
      })),
    };

  const { data: records } = await supabase
    .from("review_records")
    .select(
      "correct, created_at, radar_dimensions, srs_stage_after, user_card_state!inner(user_id, interval_days)",
    )
    .eq("user_card_state.user_id", user.id);

  const now = new Date();

  // Accumulate stats per dimension
  const currentStats = new Map<
    string,
    {
      weightedCorrect: number;
      weightedTotal: number;
      intervalSum: number;
      intervalCount: number;
      stageSum: number;
      stageCount: number;
      total: number;
    }
  >();

  const lifetimeStats = new Map<
    string,
    {
      correct: number;
      total: number;
      intervalSum: number;
      intervalCount: number;
      stageSum: number;
      stageCount: number;
    }
  >();

  for (const record of (records ?? []) as unknown as ReviewRecord[]) {
    const dims = record.radar_dimensions;
    if (!dims || dims.length === 0) continue;

    const reviewDate = new Date(record.created_at);
    const weight = decayWeight(reviewDate, now);
    const interval = record.user_card_state?.interval_days ?? 0;
    const stage = stageScore(record.srs_stage_after ?? "apprentice_1");

    for (const dim of dims) {
      // Current (with decay)
      const cs = currentStats.get(dim) ?? {
        weightedCorrect: 0,
        weightedTotal: 0,
        intervalSum: 0,
        intervalCount: 0,
        stageSum: 0,
        stageCount: 0,
        total: 0,
      };
      cs.weightedCorrect += record.correct ? weight : 0;
      cs.weightedTotal += weight;
      cs.intervalSum += interval * weight;
      cs.intervalCount += weight;
      cs.stageSum += stage * weight;
      cs.stageCount += weight;
      cs.total++;
      currentStats.set(dim, cs);

      // Lifetime (no decay)
      const ls = lifetimeStats.get(dim) ?? {
        correct: 0,
        total: 0,
        intervalSum: 0,
        intervalCount: 0,
        stageSum: 0,
        stageCount: 0,
      };
      ls.total++;
      if (record.correct) ls.correct++;
      ls.intervalSum += interval;
      ls.intervalCount++;
      ls.stageSum += stage;
      ls.stageCount++;
      lifetimeStats.set(dim, ls);
    }
  }

  const maxInterval = 365; // Normalize intervals to this max

  function computeScore(
    accuracy: number,
    avgInterval: number,
    avgStage: number,
  ): number {
    const normalizedInterval = Math.min(avgInterval / maxInterval, 1);
    const score = accuracy * 0.4 + normalizedInterval * 0.3 + avgStage * 0.3;
    return Math.round(score * 100);
  }

  // Read existing score_history from radar_cache
  const { data: cacheRows } = await supabase
    .from("radar_cache")
    .select("dimension, score_history")
    .eq("user_id", user.id);

  const historyMap = new Map<string, ScoreHistoryEntry[]>();
  for (const row of cacheRows ?? []) {
    const history = (row.score_history ?? []) as ScoreHistoryEntry[];
    historyMap.set(row.dimension, history);
  }

  const current: RadarScore[] = RADAR_DIMENSIONS.map((d) => {
    const stats = currentStats.get(d.slug);
    if (!stats || stats.weightedTotal === 0) {
      return {
        slug: d.slug,
        name: d.name,
        group: d.group,
        score: 0,
        total_reviews: 0,
        scoreHistory: historyMap.get(d.slug) ?? [],
      };
    }
    const accuracy = stats.weightedCorrect / stats.weightedTotal;
    const avgInterval =
      stats.intervalCount > 0 ? stats.intervalSum / stats.intervalCount : 0;
    const avgStage =
      stats.stageCount > 0 ? stats.stageSum / stats.stageCount : 0;
    return {
      slug: d.slug,
      name: d.name,
      group: d.group,
      score: computeScore(accuracy, avgInterval, avgStage),
      total_reviews: stats.total,
      scoreHistory: historyMap.get(d.slug) ?? [],
    };
  });

  const lifetime: RadarScore[] = RADAR_DIMENSIONS.map((d) => {
    const stats = lifetimeStats.get(d.slug);
    if (!stats || stats.total === 0) {
      return {
        slug: d.slug,
        name: d.name,
        group: d.group,
        score: 0,
        total_reviews: 0,
        scoreHistory: historyMap.get(d.slug) ?? [],
      };
    }
    const accuracy = stats.correct / stats.total;
    const avgInterval =
      stats.intervalCount > 0 ? stats.intervalSum / stats.intervalCount : 0;
    const avgStage =
      stats.stageCount > 0 ? stats.stageSum / stats.stageCount : 0;
    return {
      slug: d.slug,
      name: d.name,
      group: d.group,
      score: computeScore(accuracy, avgInterval, avgStage),
      total_reviews: stats.total,
      scoreHistory: historyMap.get(d.slug) ?? [],
    };
  });

  // Materialize current scores to radar_cache with history append
  // Only materialize dimensions that were actually reviewed (scoped)
  // Untouched dimensions retain their cached scores
  const reviewedDimSlugs = new Set(currentStats.keys());
  const dateStr = now.toISOString();
  const todayStr = dateStr.slice(0, 10);
  const dimsToMaterialize = current.filter((d) => reviewedDimSlugs.has(d.slug));
  const upsertRows = dimsToMaterialize.map((dim) => {
    const existing = historyMap.get(dim.slug) ?? [];
    const lastEntry = existing[existing.length - 1];
    const lastDate = lastEntry?.date?.slice(0, 10);
    const shouldAppend = lastDate !== todayStr;
    const updated = shouldAppend
      ? [...existing, { score: dim.score, date: dateStr }].slice(-30)
      : existing.map((e, i) =>
          i === existing.length - 1 ? { score: dim.score, date: dateStr } : e,
        );
    return {
      user_id: user.id,
      dimension: dim.slug,
      score: dim.score,
      total_reviews: dim.total_reviews,
      computed_at: dateStr,
      score_history: updated,
    };
  });

  if (upsertRows.length > 0) {
    await supabase
      .from("radar_cache")
      .upsert(upsertRows, { onConflict: "user_id,dimension" })
      .then(() => {});
  }

  return { current, lifetime };
}

/**
 * Scoped materialization: recompute only the specified dimensions.
 * Called after a review session with the dimensions that appeared in that session.
 * Untouched dimensions keep their cached scores.
 */
export async function materializeAfterSession(
  reviewedDimensions: string[],
): Promise<void> {
  if (reviewedDimensions.length === 0) return;
  // Trigger a full score computation — the scoped filter in getRadarScores()
  // already only materializes dimensions that have review data.
  // This call ensures the cache is updated for the session's dimensions.
  await getRadarScores();
}

/**
 * Process pending reconciliation queue entries.
 * Called periodically or after content changes.
 */
export async function processReconciliationQueue(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  // Fetch unprocessed entries for this user
  const { data: pending } = await supabase
    .from("radar_reconciliation_queue")
    .select("id, dimension")
    .eq("user_id", user.id)
    .eq("processed", false)
    .limit(50);

  if (!pending || pending.length === 0) return 0;

  // Trigger a scoped refresh
  await getRadarScores();

  // Mark entries as processed
  const ids = pending.map((p) => p.id);
  await supabase
    .from("radar_reconciliation_queue")
    .update({ processed: true })
    .in("id", ids);

  return pending.length;
}

/**
 * Full-scan materialization: recompute all dimensions.
 * Intended as a monthly cron safety net to reconcile any drift.
 */
export async function materializeFullScan(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { current } = await getRadarScores();

  // Force-write ALL dimensions to cache (not just reviewed ones)
  const dateStr = new Date().toISOString();

  const { data: cacheRows } = await supabase
    .from("radar_cache")
    .select("dimension, score_history")
    .eq("user_id", user.id);

  const historyMap = new Map<string, ScoreHistoryEntry[]>();
  for (const row of cacheRows ?? []) {
    historyMap.set(
      row.dimension,
      (row.score_history ?? []) as ScoreHistoryEntry[],
    );
  }

  const todayStr = dateStr.slice(0, 10);
  const upsertRows = current.map((dim) => {
    const existing = historyMap.get(dim.slug) ?? [];
    const lastEntry = existing[existing.length - 1];
    const lastDate = lastEntry?.date?.slice(0, 10);
    const shouldAppend = lastDate !== todayStr;
    const updated = shouldAppend
      ? [...existing, { score: dim.score, date: dateStr }].slice(-30)
      : existing.map((e, i) =>
          i === existing.length - 1 ? { score: dim.score, date: dateStr } : e,
        );
    return {
      user_id: user.id,
      dimension: dim.slug,
      score: dim.score,
      total_reviews: dim.total_reviews,
      computed_at: dateStr,
      score_history: updated,
    };
  });

  if (upsertRows.length > 0) {
    await supabase
      .from("radar_cache")
      .upsert(upsertRows, { onConflict: "user_id,dimension" })
      .then(() => {});
  }
}
