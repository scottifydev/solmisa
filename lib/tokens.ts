export const brand = {
  night: "#08080c",
  obsidian: "#0f0f16",
  slate: "#181821",
  graphite: "#22222f",
  steel: "#2e2e3e",
  ivory: "#eae8e4",
  silver: "#a09bb3",
  ash: "#65607a",
  shadow: "#3d3852",
  coral: "#FF6B6B",
  coralBright: "#FF8A8A",
  coralDim: "#CC5555",
  coralGhost: "rgba(255,107,107,0.08)",
  correct: "#4ade80",
  correctDim: "rgba(74,222,128,0.10)",
  warning: "#fbbf24",
  warningDim: "rgba(251,191,36,0.10)",
  incorrect: "#f87171",
  incorrectDim: "rgba(248,113,113,0.10)",
  info: "#60a5fa",
  infoDim: "rgba(96,165,250,0.10)",
} as const;

// Legacy alias — components that import `colors` still work
export const colors = brand;

export const degreeColors = {
  1: "#e2e2e2",
  2: "#ff6b9d",
  3: "#a78bfa",
  4: "#60a5fa",
  5: "#34d399",
  6: "#f59e0b",
  7: "#ef4444",
} as const;

export const chromaticDegreeColors = {
  b2: "#e74c6f",
  b3: "#c084fc",
  "#4": "#38bdf8",
  b6: "#fbbf24",
  b7: "#f97316",
} as const;

export const srsStageColors = {
  apprentice: "#f87171",
  journeyman: "#fbbf24",
  adept: "#34d399",
  virtuoso: "#60a5fa",
  mastered: "#b794f6",
} as const;

export const srsStageLabels = {
  apprentice: "Apprentice",
  journeyman: "Journeyman",
  adept: "Adept",
  virtuoso: "Virtuoso",
  mastered: "Mastered",
} as const;

// SRS stage rendering data — colors/labels are the source of truth here.
// For stage logic (transitions, intervals, scheduling), see types/srs.ts.
export const srsStages = {
  apprentice: { label: "Apprentice", color: "#f87171", icon: "\u{1F331}" },
  journeyman: { label: "Journeyman", color: "#fbbf24", icon: "\u{1F525}" },
  adept: { label: "Adept", color: "#34d399", icon: "\u{26A1}" },
  virtuoso: { label: "Virtuoso", color: "#60a5fa", icon: "\u{1F48E}" },
  mastered: { label: "Mastered", color: "#b794f6", icon: "\u{1F451}" },
} as const;

export const type = {
  display: "'Outfit', sans-serif",
  body: "'DM Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const semanticColors = {
  correct: "#4ade80",
  incorrect: "#f87171",
  warning: "#fbbf24",
  info: "#60a5fa",
} as const;
