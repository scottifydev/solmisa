import { describe, it, expect } from "vitest";
import {
  createInitialState,
  selectNextItem,
  processResponse,
  isComplete,
  getPlacement,
} from "@/lib/cat/engine";
import { ITEM_BANK } from "@/lib/cat/item-bank";

describe("CAT Engine", () => {
  describe("createInitialState", () => {
    it("initializes all dimensions from item bank", () => {
      const state = createInitialState();
      expect(state.estimates.length).toBeGreaterThan(0);
      expect(state.administered).toEqual([]);
      expect(state.responses).toEqual([]);
      expect(state.completed).toBe(false);
    });

    it("all estimates start at theta=0 with high SE", () => {
      const state = createInitialState();
      for (const est of state.estimates) {
        expect(est.theta).toBe(0);
        expect(est.standardError).toBe(1.5);
        expect(est.itemsAdministered).toBe(0);
      }
    });
  });

  describe("selectNextItem", () => {
    it("returns an item from the bank", () => {
      const state = createInitialState();
      const item = selectNextItem(state);
      expect(item).not.toBeNull();
      expect(ITEM_BANK.some((i) => i.id === item!.id)).toBe(true);
    });

    it("never returns an already-administered item", () => {
      let state = createInitialState();
      const seen = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const item = selectNextItem(state);
        if (!item) break;
        expect(seen.has(item.id)).toBe(false);
        seen.add(item.id);
        state = processResponse(state, item, i % 2 === 0, 1000);
      }
    });

    it("returns null when test is complete", () => {
      let state = createInitialState();
      state = { ...state, completed: true };
      expect(selectNextItem(state)).toBeNull();
    });
  });

  describe("processResponse", () => {
    it("updates the correct dimension estimate", () => {
      const state = createInitialState();
      const item = selectNextItem(state)!;
      const newState = processResponse(state, item, true, 1000);

      const oldEst = state.estimates.find(
        (e) => e.dimension === item.dimension,
      )!;
      const newEst = newState.estimates.find(
        (e) => e.dimension === item.dimension,
      )!;

      // Correct answer should increase theta
      expect(newEst.theta).toBeGreaterThan(oldEst.theta);
      expect(newEst.itemsAdministered).toBe(1);
    });

    it("decreases theta for incorrect answers", () => {
      const state = createInitialState();
      const item = selectNextItem(state)!;
      const newState = processResponse(state, item, false, 1000);

      const newEst = newState.estimates.find(
        (e) => e.dimension === item.dimension,
      )!;

      // Incorrect answer should decrease theta
      expect(newEst.theta).toBeLessThan(0);
    });

    it("reduces standard error with more items", () => {
      const state = createInitialState();
      const item = selectNextItem(state)!;
      const newState = processResponse(state, item, true, 1000);

      const oldEst = state.estimates.find(
        (e) => e.dimension === item.dimension,
      )!;
      const newEst = newState.estimates.find(
        (e) => e.dimension === item.dimension,
      )!;

      expect(newEst.standardError).toBeLessThanOrEqual(oldEst.standardError);
    });

    it("adds item to administered list", () => {
      const state = createInitialState();
      const item = selectNextItem(state)!;
      const newState = processResponse(state, item, true, 1000);

      expect(newState.administered).toContain(item.id);
      expect(newState.responses.length).toBe(1);
    });

    it("keeps theta within [-3, 3] bounds", () => {
      let state = createInitialState();
      // Answer many items incorrectly to push theta down
      for (let i = 0; i < 15; i++) {
        const item = selectNextItem(state);
        if (!item) break;
        state = processResponse(state, item, false, 500);
      }

      for (const est of state.estimates) {
        expect(est.theta).toBeGreaterThanOrEqual(-3);
        expect(est.theta).toBeLessThanOrEqual(3);
      }
    });
  });

  describe("isComplete", () => {
    it("returns false for initial state", () => {
      expect(isComplete(createInitialState())).toBe(false);
    });

    it("returns true when max items reached", () => {
      let state = createInitialState();
      for (let i = 0; i < 20; i++) {
        const item = selectNextItem(state);
        if (!item) break;
        state = processResponse(state, item, i % 3 !== 0, 800);
      }
      // After 20 items, should be complete
      expect(state.completed).toBe(true);
    });
  });

  describe("getPlacement", () => {
    it("returns placement with tracks and radar scores", () => {
      let state = createInitialState();
      // Run a few items
      for (let i = 0; i < 5; i++) {
        const item = selectNextItem(state);
        if (!item) break;
        state = processResponse(state, item, true, 1000);
      }

      const placement = getPlacement(state);
      expect(placement.tracks.length).toBeGreaterThan(0);
      expect(placement.radarScores.length).toBeGreaterThan(0);

      for (const track of placement.tracks) {
        expect(track.startingLesson).toBeGreaterThanOrEqual(1);
        expect(["high", "medium", "low"]).toContain(track.confidence);
      }

      for (const score of placement.radarScores) {
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.score).toBeLessThanOrEqual(100);
      }
    });

    it("beginner (all wrong) places lower than advanced (all correct)", () => {
      let beginnerState = createInitialState();
      for (let i = 0; i < 20; i++) {
        const item = selectNextItem(beginnerState);
        if (!item) break;
        beginnerState = processResponse(beginnerState, item, false, 2000);
      }

      let advancedState = createInitialState();
      for (let i = 0; i < 20; i++) {
        const item = selectNextItem(advancedState);
        if (!item) break;
        advancedState = processResponse(advancedState, item, true, 500);
      }

      const beginnerPlacement = getPlacement(beginnerState);
      const advancedPlacement = getPlacement(advancedState);

      const avgBeginner =
        beginnerPlacement.tracks.reduce((s, t) => s + t.startingLesson, 0) /
        beginnerPlacement.tracks.length;
      const avgAdvanced =
        advancedPlacement.tracks.reduce((s, t) => s + t.startingLesson, 0) /
        advancedPlacement.tracks.length;

      expect(avgBeginner).toBeLessThan(avgAdvanced);
    });

    it("advanced (all correct) places at higher lessons", () => {
      let state = createInitialState();
      for (let i = 0; i < 20; i++) {
        const item = selectNextItem(state);
        if (!item) break;
        state = processResponse(state, item, true, 500);
      }

      const placement = getPlacement(state);
      const maxLesson = Math.max(
        ...placement.tracks.map((t) => t.startingLesson),
      );
      expect(maxLesson).toBeGreaterThan(1);
    });

    it("identifies low confidence dimensions", () => {
      const state = createInitialState();
      const placement = getPlacement(state);
      // Initial state has high SE everywhere → all should be low confidence
      expect(placement.lowConfidenceDimensions.length).toBeGreaterThan(0);
    });
  });
});

describe("Item Bank", () => {
  it("has at least 25 items", () => {
    expect(ITEM_BANK.length).toBeGreaterThanOrEqual(25);
  });

  it("covers all 4 tracks", () => {
    const groups = new Set(ITEM_BANK.map((item) => item.group));
    expect(groups.has("degree_recognition")).toBe(true);
    expect(groups.has("theory")).toBe(true);
    expect(groups.has("rhythm")).toBe(true);
    expect(groups.has("sight_reading")).toBe(true);
  });

  it("has items at multiple difficulty levels", () => {
    const difficulties = new Set(ITEM_BANK.map((item) => item.difficulty));
    expect(difficulties.size).toBeGreaterThanOrEqual(4);
  });

  it("all items have valid structure", () => {
    for (const item of ITEM_BANK) {
      expect(item.id).toBeTruthy();
      expect(item.dimension).toBeTruthy();
      expect(item.difficulty).toBeGreaterThanOrEqual(1);
      expect(item.difficulty).toBeLessThanOrEqual(5);
      expect(item.prompt).toBeTruthy();
      expect(item.correct_answer).toBeTruthy();
    }
  });

  it("MC and aural items have options", () => {
    const needOptions = ITEM_BANK.filter(
      (i) => i.item_type === "multiple_choice" || i.item_type === "aural",
    );
    for (const item of needOptions) {
      expect(item.options).toBeDefined();
      expect(item.options!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("aural items have audio_degrees", () => {
    const auralItems = ITEM_BANK.filter((i) => i.item_type === "aural");
    for (const item of auralItems) {
      expect(item.audio_degrees).toBeDefined();
      expect(item.audio_degrees!.length).toBeGreaterThan(0);
    }
  });

  it("correct_answer exists in options", () => {
    for (const item of ITEM_BANK) {
      if (item.options) {
        const optionIds = item.options.map((o) => o.id);
        expect(optionIds).toContain(item.correct_answer);
      }
    }
  });
});
