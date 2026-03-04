export interface ActivityType {
  key: string;
  label: string;
  icon: string;
  defaultDuration: number;
  axisImpacts: Record<string, number>;
}

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    key: "practiced",
    label: "Practiced instrument",
    icon: "\u{1F3B9}",
    defaultDuration: 30,
    axisImpacts: { practice_discipline: 2, performance: 1 },
  },
  {
    key: "composed",
    label: "Composed / arranged",
    icon: "\u{1F3B5}",
    defaultDuration: 30,
    axisImpacts: { composition: 3, music_literacy: 1 },
  },
  {
    key: "performed",
    label: "Performed",
    icon: "\u{1F3A4}",
    defaultDuration: 60,
    axisImpacts: { performance: 5, practice_discipline: 1 },
  },
  {
    key: "listened",
    label: "Listened actively",
    icon: "\u{1F3A7}",
    defaultDuration: 20,
    axisImpacts: { active_listening: 3, ear_training: 1 },
  },
  {
    key: "studied",
    label: "Studied theory",
    icon: "\u{1F4DA}",
    defaultDuration: 30,
    axisImpacts: { music_literacy: 2, chords_harmony: 1 },
  },
  {
    key: "sight_read",
    label: "Sight read",
    icon: "\u{1F4C4}",
    defaultDuration: 15,
    axisImpacts: { sight_reading: 3, music_literacy: 1 },
  },
];
