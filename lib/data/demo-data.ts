import type { ReviewQueueItem, ReviewStatsResponse } from "@/types/srs";

export const DEMO_STATS: ReviewStatsResponse = {
  totalCards: 12,
  dueToday: 5,
  reviewsToday: 3,
  streakDays: 2,
  byStage: [
    { stage: "apprentice", count: 5, percentage: 41.7 },
    { stage: "journeyman", count: 4, percentage: 33.3 },
    { stage: "adept", count: 2, percentage: 16.7 },
    { stage: "virtuoso", count: 1, percentage: 8.3 },
  ],
};

export const DEMO_REVIEW_CARDS: ReviewQueueItem[] = [
  {
    cardId: "demo-1",
    front: "Which degree has the strongest pull toward tonic?",
    back: "Ti (7) \u2014 the leading tone. It wants to resolve up to Do.",
    dueAt: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    stage: "apprentice",
    cardCategory: "declarative",
  },
  {
    cardId: "demo-2",
    front: "Sol (5) is also called the...",
    back: "Dominant \u2014 the second most stable degree after tonic",
    dueAt: new Date().toISOString(),
    interval: 3,
    easeFactor: 2.6,
    stage: "journeyman",
    cardCategory: "declarative",
  },
  {
    cardId: "demo-3",
    front: "In major, what\u2019s the interval from Do to Mi?",
    back: "Major 3rd \u2014 the bright, warm interval of the tonic triad",
    dueAt: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    stage: "apprentice",
    cardCategory: "declarative",
  },
  {
    cardId: "demo-teaser",
    front: "Listen: which scale degree do you hear?",
    back: "",
    dueAt: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    stage: "apprentice",
    cardCategory: "perceptual",
  },
];
