import type {
  CATItem,
  CATState,
  DimensionEstimate,
  PlacementResult,
  ConfidenceLevel,
} from "./types";
import { ITEM_BANK } from "./item-bank";
import { RADAR_DIMENSIONS, type RadarGroup } from "@/lib/radar/dimensions";

const MAX_ITEMS = 20;
const SE_CONVERGENCE_THRESHOLD = 0.5;
const INITIAL_THETA = 0;
const INITIAL_SE = 1.5;

// IRT 1PL probability of correct response
function iccProbability(theta: number, difficulty: number): number {
  // Map 1-5 difficulty to logit scale (-2 to +2)
  const b = (difficulty - 3) * 1.0;
  return 1 / (1 + Math.exp(-(theta - b)));
}

// Fisher information at current theta for a given difficulty
function fisherInfo(theta: number, difficulty: number): number {
  const p = iccProbability(theta, difficulty);
  return p * (1 - p);
}

function initializeEstimates(): DimensionEstimate[] {
  const dims = new Map<string, RadarGroup>();
  for (const item of ITEM_BANK) {
    if (!dims.has(item.dimension)) {
      dims.set(item.dimension, item.group);
    }
  }

  return Array.from(dims.entries()).map(([dimension, group]) => ({
    dimension,
    group,
    theta: INITIAL_THETA,
    standardError: INITIAL_SE,
    itemsAdministered: 0,
  }));
}

export function createInitialState(): CATState {
  return {
    estimates: initializeEstimates(),
    administered: [],
    responses: [],
    completed: false,
  };
}

export function selectNextItem(state: CATState): CATItem | null {
  if (state.completed || state.administered.length >= MAX_ITEMS) {
    return null;
  }

  // Check if all dimensions have converged
  const unconverged = state.estimates.filter(
    (e) => e.standardError > SE_CONVERGENCE_THRESHOLD,
  );
  if (unconverged.length === 0) {
    return null;
  }

  // Sort dimensions by standard error (highest first — least confident)
  const sorted = [...unconverged].sort(
    (a, b) => b.standardError - a.standardError,
  );

  // Try each dimension in order of lowest confidence
  for (const estimate of sorted) {
    const available = ITEM_BANK.filter(
      (item) =>
        item.dimension === estimate.dimension &&
        !state.administered.includes(item.id),
    );

    if (available.length === 0) continue;

    // Select item with difficulty closest to current ability estimate
    // Map theta to 1-5 scale: theta 0 = difficulty 3
    const targetDifficulty = Math.max(1, Math.min(5, estimate.theta + 3));
    available.sort(
      (a, b) =>
        Math.abs(a.difficulty - targetDifficulty) -
        Math.abs(b.difficulty - targetDifficulty),
    );

    return available[0] ?? null;
  }

  return null;
}

export function processResponse(
  state: CATState,
  item: CATItem,
  correct: boolean,
  responseTimeMs: number,
): CATState {
  const newState: CATState = {
    ...state,
    administered: [...state.administered, item.id],
    responses: [
      ...state.responses,
      { itemId: item.id, correct, responseTimeMs },
    ],
    estimates: state.estimates.map((est) => {
      if (est.dimension !== item.dimension) return est;

      // IRT 1PL EAP update (simplified)
      const p = iccProbability(est.theta, item.difficulty);
      const residual = (correct ? 1 : 0) - p;

      // Step size decreases with more items
      const stepSize = 1 / (est.itemsAdministered + 1);
      const newTheta = est.theta + stepSize * residual;

      // Update standard error using Fisher information
      const totalInfo =
        state.responses
          .filter((r) => {
            const rItem = ITEM_BANK.find((i) => i.id === r.itemId);
            return rItem?.dimension === est.dimension;
          })
          .reduce((sum, r) => {
            const rItem = ITEM_BANK.find((i) => i.id === r.itemId);
            return sum + (rItem ? fisherInfo(newTheta, rItem.difficulty) : 0);
          }, 0) + fisherInfo(newTheta, item.difficulty);

      const newSE =
        totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : est.standardError;

      return {
        ...est,
        theta: Math.max(-3, Math.min(3, newTheta)),
        standardError: Math.min(newSE, est.standardError),
        itemsAdministered: est.itemsAdministered + 1,
      };
    }),
    completed: false,
  };

  // Check completion
  const allConverged = newState.estimates.every(
    (e) => e.standardError <= SE_CONVERGENCE_THRESHOLD,
  );
  newState.completed =
    allConverged || newState.administered.length >= MAX_ITEMS;

  return newState;
}

export function isComplete(state: CATState): boolean {
  return state.completed;
}

function thetaToConfidence(se: number): ConfidenceLevel {
  if (se <= 0.3) return "high";
  if (se <= 0.6) return "medium";
  return "low";
}

function thetaToRadarScore(theta: number): number {
  // Map theta (-3 to +3) to score (0-100)
  const normalized = (theta + 3) / 6;
  return Math.round(Math.max(0, Math.min(100, normalized * 100)));
}

function thetaToStartingLesson(theta: number): number {
  // Map theta to starting lesson number
  // theta < -1: lesson 1 (beginner)
  // theta -1 to 0: lesson 2
  // theta 0 to 1: lesson 3
  // theta > 1: lesson 4+
  if (theta < -1) return 1;
  if (theta < 0) return 2;
  if (theta < 1) return 3;
  return 4;
}

const DIMENSION_TO_TRACK: Record<string, string> = {
  degree_1: "ear_training",
  degree_2: "ear_training",
  degree_3: "ear_training",
  degree_5: "ear_training",
  interval_id: "ear_training",
  chord_quality: "ear_training",
  key_signatures: "theory",
  scales: "theory",
  roman_numerals: "theory",
  rhythm_accuracy: "rhythm",
  meter_id: "rhythm",
  note_reading: "sight_reading",
};

export function getPlacement(state: CATState): PlacementResult {
  const trackEstimates = new Map<string, DimensionEstimate[]>();
  for (const est of state.estimates) {
    const track = DIMENSION_TO_TRACK[est.dimension] ?? "ear_training";
    const existing = trackEstimates.get(track) ?? [];
    existing.push(est);
    trackEstimates.set(track, existing);
  }

  const tracks = Array.from(trackEstimates.entries()).map(([slug, dims]) => {
    const avgTheta =
      dims.length > 0 ? dims.reduce((s, d) => s + d.theta, 0) / dims.length : 0;
    const avgSE =
      dims.length > 0
        ? dims.reduce((s, d) => s + d.standardError, 0) / dims.length
        : INITIAL_SE;

    return {
      trackSlug: slug,
      startingLesson: thetaToStartingLesson(avgTheta),
      confidence: thetaToConfidence(avgSE),
      dimensions: dims,
    };
  });

  const radarScores = state.estimates.map((est) => {
    const dimDef = RADAR_DIMENSIONS.find((d) => d.slug === est.dimension);
    return {
      slug: est.dimension,
      name: dimDef?.name ?? est.dimension,
      group: est.group,
      score: thetaToRadarScore(est.theta),
    };
  });

  const lowConfidenceDimensions = state.estimates
    .filter((e) => thetaToConfidence(e.standardError) === "low")
    .map((e) => e.dimension);

  return { tracks, radarScores, lowConfidenceDimensions };
}
