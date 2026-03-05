import type { NoteName, DiatonicDegree, Timbre } from "@/types/audio";
import { MODULE_KEY_POOLS } from "@/types/audio";

/**
 * Context variation for SRS review sessions.
 * Prevents memorization of specific sounds by randomizing key, timbre, octave, and rhythm.
 */

export interface VariationContext {
  key: NoteName;
  timbre: Timbre;
  octave: number;
  rhythmOffset: "on_beat" | "off_beat" | "pickup";
}

export interface VariationOptions {
  moduleOrder?: number;
  excludeKey?: NoteName;
  excludeTimbre?: Timbre;
  excludeOctave?: number;
}

const AVAILABLE_TIMBRES: Timbre[] = [
  "sine",
  "piano",
  "bell",
  "guitar",
  "strings",
];
const AVAILABLE_OCTAVES = [3, 4, 5];
const RHYTHM_OFFSETS: VariationContext["rhythmOffset"][] = [
  "on_beat",
  "off_beat",
  "pickup",
];

function pickRandom<T>(items: readonly T[], exclude?: T): T {
  const filtered =
    exclude !== undefined ? items.filter((i) => i !== exclude) : [...items];
  const pool = filtered.length > 0 ? filtered : [...items];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function generateVariation(
  options?: VariationOptions,
): VariationContext {
  const moduleOrder = options?.moduleOrder ?? 1;

  // Key pool depends on module progression
  const maxPool = Math.max(...Object.keys(MODULE_KEY_POOLS).map(Number));
  const poolKey = Math.min(moduleOrder, maxPool);
  const keyPool = MODULE_KEY_POOLS[poolKey] ?? MODULE_KEY_POOLS[1]!;

  return {
    key: pickRandom(keyPool, options?.excludeKey),
    timbre: pickRandom(AVAILABLE_TIMBRES, options?.excludeTimbre),
    octave: pickRandom(AVAILABLE_OCTAVES, options?.excludeOctave),
    rhythmOffset: pickRandom(RHYTHM_OFFSETS),
  };
}

/**
 * Generate a batch of variations that are all distinct from each other.
 * Useful for generating a set of review contexts within a single session.
 */
export function generateVariationBatch(
  count: number,
  options?: VariationOptions,
): VariationContext[] {
  const results: VariationContext[] = [];
  let lastKey: NoteName | undefined;
  let lastTimbre: Timbre | undefined;
  let lastOctave: number | undefined;

  for (let i = 0; i < count; i++) {
    const variation = generateVariation({
      ...options,
      excludeKey: lastKey ?? options?.excludeKey,
      excludeTimbre: lastTimbre ?? options?.excludeTimbre,
      excludeOctave: lastOctave ?? options?.excludeOctave,
    });
    results.push(variation);
    lastKey = variation.key;
    lastTimbre = variation.timbre;
    lastOctave = variation.octave;
  }

  return results;
}

/**
 * Map a concept description to the appropriate audio parameters.
 * Used by the SRS review engine to determine how to play a card.
 */
export interface ConceptAudioParams {
  type: "degree" | "interval" | "chord" | "sequence";
  degree?: DiatonicDegree;
  degrees?: DiatonicDegree[];
  interval?: string;
  chordQuality?: string;
}

export function applyVariation(
  concept: ConceptAudioParams,
  variation: VariationContext,
): {
  key: NoteName;
  octave: number;
  timbre: Timbre;
} & ConceptAudioParams {
  return {
    ...concept,
    key: variation.key,
    octave: variation.octave,
    timbre: variation.timbre,
  };
}
