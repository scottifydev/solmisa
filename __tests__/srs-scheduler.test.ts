import { describe, it, expect } from "vitest";
import { computeSchedule } from "@/lib/srs/scheduler";
import type { SrsItemState, SrsStageKey, DifficultyTier } from "@/types/srs";

/** Fixed clock so every interval assertion is exact. */
const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

function item(overrides: Partial<SrsItemState> = {}): SrsItemState {
  return {
    id: "item-1",
    user_id: "user-1",
    card_instance_id: "card-1",
    srs_stage: "apprentice_1",
    difficulty_tier: "intro",
    ease_factor: 2.5,
    interval_days: 0,
    next_review_at: new Date(NOW).toISOString(),
    correct_streak: 0,
    total_reviews: 0,
    total_correct: 0,
    dimension_accuracy: null,
    created_at: new Date(NOW).toISOString(),
    updated_at: new Date(NOW).toISOString(),
    ...overrides,
  };
}

function schedule(
  overrides: Partial<SrsItemState>,
  correct: boolean,
  confidence?: "sure" | "guessing",
) {
  return computeSchedule(
    {
      item: item(overrides),
      card_category: "declarative",
      correct,
      response_time_ms: 1200,
      ...(confidence ? { confidence } : {}),
    },
    NOW,
  );
}

describe("computeSchedule purity", () => {
  it("is deterministic for the same input and clock", () => {
    const a = schedule({}, true);
    const b = schedule({}, true);
    expect(a).toEqual(b);
  });

  it("schedules relative to the injected clock, not the wall clock", () => {
    const result = schedule({}, true);
    const expected = NOW + result.new_interval_days * DAY_MS;
    expect(Date.parse(result.next_review_at)).toBeCloseTo(expected, -2);
  });
});

describe("stage transitions", () => {
  it("advances one stage on a correct answer", () => {
    expect(schedule({ srs_stage: "apprentice_1" }, true).new_stage).toBe(
      "apprentice_2",
    );
  });

  it("steps back on a wrong answer", () => {
    expect(schedule({ srs_stage: "apprentice_3" }, false).new_stage).toBe(
      "apprentice_2",
    );
  });

  it("does not fall below the first stage", () => {
    expect(schedule({ srs_stage: "apprentice_1" }, false).new_stage).toBe(
      "apprentice_1",
    );
  });

  it("holds mastered items at the far-future review date", () => {
    const result = schedule({ srs_stage: "mastered" }, true);
    expect(result.next_review_at.startsWith("9999")).toBe(true);
    expect(result.new_interval_days).toBe(0);
  });
});

describe("difficulty tier gating", () => {
  const tiers: DifficultyTier[] = ["intro", "core"];

  it.each(tiers)("blocks %s tier from advancing past journeyman_2", (tier) => {
    const result = schedule(
      { srs_stage: "journeyman_2", difficulty_tier: tier },
      true,
    );
    // The candidate stage would be adept_1; the tier gate holds it back.
    expect(result.new_stage).toBe("journeyman_2");
  });

  it("lets the stretch tier through", () => {
    const result = schedule(
      { srs_stage: "journeyman_2", difficulty_tier: "stretch" },
      true,
    );
    expect(result.new_stage).toBe("adept_1");
  });
});

describe("ease factor", () => {
  it("rises on a correct answer and falls on a wrong one", () => {
    expect(
      schedule({ ease_factor: 2.5 }, true).new_ease_factor,
    ).toBeGreaterThan(2.5);
    expect(schedule({ ease_factor: 2.5 }, false).new_ease_factor).toBeLessThan(
      2.5,
    );
  });

  it("halves the boost when the learner says they guessed", () => {
    const sure = schedule({ ease_factor: 2.5 }, true, "sure");
    const guessing = schedule({ ease_factor: 2.5 }, true, "guessing");
    const sureGain = sure.new_ease_factor - 2.5;
    const guessGain = guessing.new_ease_factor - 2.5;
    expect(guessGain).toBeCloseTo(sureGain / 2, 6);
  });

  it("stays inside the configured bounds", () => {
    expect(
      schedule({ ease_factor: 3.0 }, true).new_ease_factor,
    ).toBeLessThanOrEqual(3.0);
    expect(
      schedule({ ease_factor: 1.3 }, false).new_ease_factor,
    ).toBeGreaterThanOrEqual(1.3);
  });
});

describe("tier promotion", () => {
  it("promotes on a strong record and restarts at the first stage", () => {
    const result = schedule(
      {
        srs_stage: "journeyman_2",
        difficulty_tier: "intro",
        total_reviews: 12,
        total_correct: 12,
      },
      true,
    );
    expect(result.tier_promoted).toBe(true);
    expect(result.new_difficulty_tier).toBe("core");
    expect(result.new_stage).toBe("apprentice_1");
    // Promotion uses a shortened interval so the harder tier is seen soon.
    expect(result.new_interval_days).toBeLessThan(1);
  });

  it("does not promote without enough reviews", () => {
    const result = schedule(
      {
        srs_stage: "journeyman_2",
        difficulty_tier: "intro",
        total_reviews: 4,
        total_correct: 4,
      },
      true,
    );
    expect(result.tier_promoted).toBe(false);
  });

  it("does not promote below the accuracy threshold", () => {
    const result = schedule(
      {
        srs_stage: "journeyman_2",
        difficulty_tier: "intro",
        total_reviews: 20,
        total_correct: 10,
      },
      true,
    );
    expect(result.tier_promoted).toBe(false);
  });

  it("never promotes past the stretch tier", () => {
    const result = schedule(
      {
        srs_stage: "journeyman_2",
        difficulty_tier: "stretch",
        total_reviews: 20,
        total_correct: 20,
      },
      true,
    );
    expect(result.tier_promoted).toBe(false);
    expect(result.new_difficulty_tier).toBe("stretch");
  });
});

describe("tier demotion", () => {
  it("demotes after consecutive wrong answers", () => {
    const result = schedule(
      { difficulty_tier: "core", correct_streak: 0, total_reviews: 8 },
      false,
    );
    expect(result.new_difficulty_tier).toBe("intro");
  });

  it("does not demote below the first tier", () => {
    const result = schedule(
      { difficulty_tier: "intro", correct_streak: 0, total_reviews: 8 },
      false,
    );
    expect(result.new_difficulty_tier).toBe("intro");
  });

  it("does not demote on a first wrong answer", () => {
    const result = schedule(
      { difficulty_tier: "core", correct_streak: 3, total_reviews: 8 },
      false,
    );
    expect(result.new_difficulty_tier).toBe("core");
  });
});

describe("interval growth", () => {
  it("lengthens as the stage advances", () => {
    const stages: SrsStageKey[] = [
      "apprentice_1",
      "apprentice_2",
      "apprentice_3",
      "apprentice_4",
    ];
    const intervals = stages.map(
      (srs_stage) =>
        schedule({ srs_stage, difficulty_tier: "stretch" }, true)
          .new_interval_days,
    );
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]!).toBeGreaterThan(intervals[i - 1]!);
    }
  });
});
