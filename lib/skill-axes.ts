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

/** Maps DB snake_case axis names to display names */
export const AXIS_DB_TO_DISPLAY: Record<string, string> = {
  key_signatures: "Key Signatures",
  intervals: "Intervals",
  scales_modes: "Scales & Modes",
  chords_harmony: "Chords & Harmony",
  ear_training: "Ear Training",
  rhythm_meter: "Rhythm & Meter",
  performance: "Performance",
  sight_reading: "Sight Reading",
  practice_discipline: "Practice Discipline",
  active_listening: "Active Listening",
  composition: "Composition & Arranging",
  music_literacy: "Music Literacy",
};

/** Maps display names to DB snake_case axis names */
export const AXIS_DISPLAY_TO_DB: Record<string, string> = Object.fromEntries(
  Object.entries(AXIS_DB_TO_DISPLAY).map(([k, v]) => [v, k]),
);
