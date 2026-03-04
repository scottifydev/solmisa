export interface SkillAxis {
  axis_name: string;
  score: number;
  max_points: number;
  percentage: number;
}

export const SKILL_AXES = [
  "Key Signatures",
  "Intervals",
  "Scales & Modes",
  "Chords & Harmony",
  "Ear Training",
  "Rhythm & Meter",
  "Performance",
  "Sight Reading",
  "Practice Discipline",
  "Active Listening",
  "Composition & Arranging",
  "Music Literacy",
] as const;

export const MAX_SKILL_POINTS = 1000;
