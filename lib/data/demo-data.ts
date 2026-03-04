import type { ReviewStatsResponse, SrsStageGroup } from "@/types/srs";

export const DEMO_STATS: ReviewStatsResponse = {
  totalCards: 12,
  dueToday: 5,
  reviewsToday: 3,
  streakDays: 2,
  byStage: [
    { stage: "apprentice", count: 5 },
    { stage: "journeyman", count: 4 },
    { stage: "adept", count: 2 },
    { stage: "virtuoso", count: 1 },
  ],
};

export interface DemoReviewCard {
  id: string;
  stage: SrsStageGroup;
  prompt: string;
  options: { id: string; label: string; degree?: number }[];
  correctAnswer: string;
}

export const DEMO_REVIEW_CARDS: DemoReviewCard[] = [
  {
    id: "demo-1",
    stage: "apprentice",
    prompt: "Which degree has the strongest pull toward tonic?",
    options: [
      { id: "a", label: "Sol (5)", degree: 5 },
      { id: "b", label: "Ti (7)", degree: 7 },
      { id: "c", label: "Re (2)", degree: 2 },
      { id: "d", label: "Fa (4)", degree: 4 },
    ],
    correctAnswer: "b",
  },
  {
    id: "demo-2",
    stage: "journeyman",
    prompt: "How many sharps are in the key of A Major?",
    options: [
      { id: "a", label: "1" },
      { id: "b", label: "2" },
      { id: "c", label: "3" },
      { id: "d", label: "4" },
    ],
    correctAnswer: "c",
  },
  {
    id: "demo-3",
    stage: "apprentice",
    prompt: "Sol (5) is also called the...",
    options: [
      { id: "a", label: "Mediant" },
      { id: "b", label: "Subdominant" },
      { id: "c", label: "Dominant" },
      { id: "d", label: "Supertonic" },
    ],
    correctAnswer: "c",
  },
  {
    id: "demo-4",
    stage: "adept",
    prompt: "Major scale with a flat 7th is which mode?",
    options: [
      { id: "a", label: "Dorian" },
      { id: "b", label: "Lydian" },
      { id: "c", label: "Mixolydian" },
      { id: "d", label: "Phrygian" },
    ],
    correctAnswer: "c",
  },
  {
    id: "demo-5",
    stage: "journeyman",
    prompt: "This degree feels like 'home.' Which is it?",
    options: [
      { id: "a", label: "Do (1)", degree: 1 },
      { id: "b", label: "Mi (3)", degree: 3 },
      { id: "c", label: "Sol (5)", degree: 5 },
      { id: "d", label: "La (6)", degree: 6 },
    ],
    correctAnswer: "a",
  },
];
