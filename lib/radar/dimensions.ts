export interface RadarDimension {
  slug: string;
  name: string;
  group: RadarGroup;
}

export type RadarGroup =
  | "degree_recognition"
  | "ear_training"
  | "theory"
  | "rhythm"
  | "sight_reading";

export const RADAR_GROUP_LABELS: Record<RadarGroup, string> = {
  degree_recognition: "Degree Recognition",
  ear_training: "Intervals & Chords",
  theory: "Theory",
  rhythm: "Rhythm",
  sight_reading: "Sight-Reading",
};

export const RADAR_DIMENSIONS: RadarDimension[] = [
  // Degree Recognition (7)
  { slug: "degree_1", name: "Do (1)", group: "degree_recognition" },
  { slug: "degree_2", name: "Re (2)", group: "degree_recognition" },
  { slug: "degree_3", name: "Mi (3)", group: "degree_recognition" },
  { slug: "degree_4", name: "Fa (4)", group: "degree_recognition" },
  { slug: "degree_5", name: "Sol (5)", group: "degree_recognition" },
  { slug: "degree_6", name: "La (6)", group: "degree_recognition" },
  { slug: "degree_7", name: "Ti (7)", group: "degree_recognition" },

  // Ear Training (2)
  { slug: "interval_id", name: "Interval Recognition", group: "ear_training" },
  { slug: "chord_quality", name: "Chord Quality", group: "ear_training" },

  // Theory (3)
  { slug: "key_signatures", name: "Key Signatures", group: "theory" },
  { slug: "scales", name: "Scales", group: "theory" },
  { slug: "roman_numerals", name: "Roman Numerals", group: "theory" },

  // Rhythm (2)
  { slug: "rhythm_accuracy", name: "Rhythm Accuracy", group: "rhythm" },
  { slug: "meter_id", name: "Meter Identification", group: "rhythm" },

  // Sight-Reading (2)
  { slug: "note_reading", name: "Note Reading", group: "sight_reading" },
  { slug: "rhythm_reading", name: "Rhythm Reading", group: "sight_reading" },
];

export const DIMENSION_MAP = new Map(RADAR_DIMENSIONS.map((d) => [d.slug, d]));

const DECAY_HALF_LIFE_DAYS = 60;

export function decayWeight(reviewDate: Date, now: Date): number {
  const daysSince =
    (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, daysSince / DECAY_HALF_LIFE_DAYS);
}
