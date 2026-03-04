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
  correctFeedback: string;
  incorrectFeedback: string;
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
    correctFeedback: "Ti sits a half-step below Do \u2014 that proximity creates the strongest gravitational pull in the scale.",
    incorrectFeedback: "The leading tone (Ti) sits a half-step below Do. That closeness creates the strongest pull toward tonic.",
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
    correctFeedback: "A Major: F\u266F, C\u266F, G\u266F. Three sharps following the order of sharps.",
    incorrectFeedback: "A Major has three sharps: F\u266F, C\u266F, G\u266F. Follow the circle of fifths from C to count them.",
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
    correctFeedback: "The dominant. It\u2019s the second most stable degree after tonic \u2014 the harmonic anchor of the scale.",
    incorrectFeedback: "Sol (5) is the dominant \u2014 the second most stable tone after tonic, and the root of the V chord.",
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
    correctFeedback: "Mixolydian. The \u266D7 gives it a bluesy, unresolved quality \u2014 common in rock and folk.",
    incorrectFeedback: "Mixolydian is a major scale with a \u266D7. Think of the dominant chord\u2019s scale \u2014 that bright-but-unsettled sound.",
  },
  {
    id: "demo-5",
    stage: "journeyman",
    prompt: "This degree feels like \u2018home.\u2019 Which is it?",
    options: [
      { id: "a", label: "Do (1)", degree: 1 },
      { id: "b", label: "Mi (3)", degree: 3 },
      { id: "c", label: "Sol (5)", degree: 5 },
      { id: "d", label: "La (6)", degree: 6 },
    ],
    correctAnswer: "a",
    correctFeedback: "Do is tonic \u2014 the point of rest. Every other degree defines itself by its relationship to this one.",
    incorrectFeedback: "Do (1) is tonic \u2014 the resting place. It\u2019s the degree that feels resolved, like arriving home.",
  },
];
