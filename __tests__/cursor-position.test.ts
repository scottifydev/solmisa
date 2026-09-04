import { describe, it, expect } from "vitest";
import {
  barAtTime,
  barProgressAtTime,
  cursorPosition,
  type CursorLayout,
  type CursorMetrics,
} from "@/lib/notation/cursor-position";

// Matches the Standards Lab stave layout.
const LAYOUT: CursorLayout = {
  padLeft: 50,
  padTop: 55,
  staveWidth: 320,
  systemHeight: 150,
  barsPerSystem: 4,
};

const UNSCALED: CursorMetrics = { scale: 1, offsetX: 0, offsetY: 0 };

describe("barAtTime", () => {
  const starts = [0, 1.3, 2.6, 3.9, 5.2];

  it("returns the first bar before the music starts", () => {
    expect(barAtTime(-1, starts)).toBe(0);
    expect(barAtTime(0, starts)).toBe(0);
  });

  it("returns the bar whose start time has passed", () => {
    expect(barAtTime(1.29, starts)).toBe(0);
    expect(barAtTime(1.3, starts)).toBe(1);
    expect(barAtTime(2.0, starts)).toBe(1);
    expect(barAtTime(3.9, starts)).toBe(3);
  });

  it("stays on the last bar past the end", () => {
    expect(barAtTime(99, starts)).toBe(4);
  });

  it("handles an empty list", () => {
    expect(barAtTime(5, [])).toBe(0);
  });
});

describe("barProgressAtTime", () => {
  const starts = [0, 1.3, 2.6];

  it("is 0 at the downbeat and 0.5 halfway through", () => {
    expect(barProgressAtTime(1.3, 1, starts, 1.3)).toBeCloseTo(0);
    expect(barProgressAtTime(1.95, 1, starts, 1.3)).toBeCloseTo(0.5);
  });

  it("clamps to the bar it is in", () => {
    expect(barProgressAtTime(99, 1, starts, 1.3)).toBe(1);
    expect(barProgressAtTime(0, 1, starts, 1.3)).toBe(0);
  });

  it("falls back to a nominal bar length on the last bar", () => {
    // starts[3] does not exist, so the final bar uses the fallback duration.
    expect(barProgressAtTime(3.25, 2, starts, 1.3)).toBeCloseTo(0.5);
  });

  it("returns 0 when the bar has no duration", () => {
    expect(barProgressAtTime(5, 0, [0, 0], 0)).toBe(0);
  });
});

describe("cursorPosition at scale 1", () => {
  it("places the first downbeat at the left padding", () => {
    const p = cursorPosition(0, 0, LAYOUT, UNSCALED);
    expect(p.left).toBe(50);
    expect(p.top).toBe(55);
    expect(p.system).toBe(0);
  });

  it("advances across the bar by the stave width", () => {
    expect(cursorPosition(0, 0.5, LAYOUT, UNSCALED).left).toBe(50 + 160);
    expect(cursorPosition(1, 0, LAYOUT, UNSCALED).left).toBe(50 + 320);
  });

  it("wraps onto the next system", () => {
    const p = cursorPosition(4, 0, LAYOUT, UNSCALED);
    expect(p.system).toBe(1);
    expect(p.left).toBe(50);
    expect(p.top).toBe(55 + 150);
  });

  it("clamps progress so the cursor never leaves its bar", () => {
    expect(cursorPosition(0, 5, LAYOUT, UNSCALED).left).toBe(50 + 320);
    expect(cursorPosition(0, -5, LAYOUT, UNSCALED).left).toBe(50);
  });
});

describe("cursorPosition honours the rendered SVG scale", () => {
  // The stave is drawn in a 1350-unit viewBox that renders at 1135 CSS px,
  // so one SVG unit is 0.8407 px. Positioning the cursor in raw SVG units
  // pushed it past the right edge of the 1152 px container.
  const metrics: CursorMetrics = { scale: 1135 / 1350, offsetX: 0, offsetY: 8 };

  it("scales horizontal position into CSS pixels", () => {
    const p = cursorPosition(3, 1, LAYOUT, metrics);
    const unscaled = cursorPosition(3, 1, LAYOUT, UNSCALED);
    expect(unscaled.left).toBe(1330);
    expect(p.left).toBeCloseTo(1330 * (1135 / 1350), 3);
  });

  it("keeps the end of a system inside the visible container", () => {
    const containerWidth = 1152;
    const endOfSystem = cursorPosition(3, 1, LAYOUT, metrics);
    expect(endOfSystem.left).toBeLessThanOrEqual(containerWidth);
  });

  it("scales vertical position and adds the container offset", () => {
    const p = cursorPosition(4, 0, LAYOUT, metrics);
    expect(p.top).toBeCloseTo(8 + (55 + 150) * (1135 / 1350), 3);
  });

  it("scales the cursor height so it matches the stave", () => {
    const p = cursorPosition(0, 0, LAYOUT, metrics, 80);
    expect(p.height).toBeCloseTo(80 * (1135 / 1350), 3);
  });

  it("adds a horizontal offset when the stave is inset", () => {
    const inset: CursorMetrics = { scale: 1, offsetX: 24, offsetY: 0 };
    expect(cursorPosition(0, 0, LAYOUT, inset).left).toBe(74);
  });
});
