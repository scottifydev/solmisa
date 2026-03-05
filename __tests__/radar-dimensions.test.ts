import { describe, it, expect } from "vitest";
import {
  RADAR_DIMENSIONS,
  RADAR_GROUP_LABELS,
  DIMENSION_MAP,
  decayWeight,
  type RadarGroup,
} from "@/lib/radar/dimensions";

describe("Radar Dimensions", () => {
  it("defines 16 dimensions", () => {
    expect(RADAR_DIMENSIONS.length).toBe(16);
  });

  it("covers all 5 groups", () => {
    const groups = new Set(RADAR_DIMENSIONS.map((d) => d.group));
    expect(groups.size).toBe(5);
    expect(groups.has("degree_recognition")).toBe(true);
    expect(groups.has("ear_training")).toBe(true);
    expect(groups.has("theory")).toBe(true);
    expect(groups.has("rhythm")).toBe(true);
    expect(groups.has("sight_reading")).toBe(true);
  });

  it("all groups have labels", () => {
    const groups: RadarGroup[] = [
      "degree_recognition",
      "ear_training",
      "theory",
      "rhythm",
      "sight_reading",
    ];
    for (const g of groups) {
      expect(RADAR_GROUP_LABELS[g]).toBeTruthy();
    }
  });

  it("all dimensions have unique slugs", () => {
    const slugs = RADAR_DIMENSIONS.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("DIMENSION_MAP indexes all dimensions", () => {
    expect(DIMENSION_MAP.size).toBe(RADAR_DIMENSIONS.length);
    for (const dim of RADAR_DIMENSIONS) {
      expect(DIMENSION_MAP.get(dim.slug)).toBe(dim);
    }
  });
});

describe("decayWeight", () => {
  it("returns 1.0 for same-day review", () => {
    const now = new Date();
    expect(decayWeight(now, now)).toBeCloseTo(1.0);
  });

  it("returns 0.5 at half-life (60 days)", () => {
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    expect(decayWeight(sixtyDaysAgo, now)).toBeCloseTo(0.5, 1);
  });

  it("returns ~0.25 at 120 days", () => {
    const now = new Date();
    const past = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
    expect(decayWeight(past, now)).toBeCloseTo(0.25, 1);
  });

  it("returns value between 0 and 1", () => {
    const now = new Date();
    const past = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const weight = decayWeight(past, now);
    expect(weight).toBeGreaterThan(0);
    expect(weight).toBeLessThan(1);
  });
});
