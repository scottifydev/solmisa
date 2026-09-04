/**
 * Playhead placement for engraved staves.
 *
 * The stave is drawn by VexFlow into a fixed SVG user-unit space and then
 * scaled to the container width by a viewBox. The cursor is a DOM element
 * layered over that SVG, so its position has to be converted from SVG units
 * into CSS pixels. Using the raw units pushes the cursor past the right edge
 * of the container, by roughly a fifth of the width at typical sizes.
 */

export interface CursorLayout {
  /** Left padding before the first stave, in SVG units. */
  padLeft: number;
  /** Top padding above the first system, in SVG units. */
  padTop: number;
  /** Width of one bar, in SVG units. */
  staveWidth: number;
  /** Vertical distance between systems, in SVG units. */
  systemHeight: number;
  barsPerSystem: number;
}

export interface CursorMetrics {
  /** CSS pixels per SVG user unit, from the rendered size over the viewBox. */
  scale: number;
  /** Where the SVG sits inside the scroll container's content box, in CSS px. */
  offsetX: number;
  offsetY: number;
}

export interface CursorPlacement {
  left: number;
  top: number;
  height: number;
  system: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Index of the bar sounding at `seconds`, given each bar's start time.
 * Times before the first bar report bar 0; times past the end hold on the
 * last bar rather than running off the score.
 */
export function barAtTime(
  seconds: number,
  barStartTimes: readonly number[],
): number {
  for (let i = barStartTimes.length - 1; i >= 0; i--) {
    if (seconds >= barStartTimes[i]!) return i;
  }
  return 0;
}

/**
 * How far through its bar `seconds` falls, from 0 at the downbeat to 1 at the
 * barline. The final bar has no following start time, so it uses
 * `fallbackBarDuration`.
 */
export function barProgressAtTime(
  seconds: number,
  barIndex: number,
  barStartTimes: readonly number[],
  fallbackBarDuration: number,
): number {
  const start = barStartTimes[barIndex];
  if (start === undefined) return 0;
  const next = barStartTimes[barIndex + 1];
  const end = next ?? start + fallbackBarDuration;
  const duration = end - start;
  if (duration <= 0) return 0;
  return clamp01((seconds - start) / duration);
}

/**
 * Convert a bar index and progress through that bar into a CSS-pixel position
 * for the cursor element, applying the SVG's rendered scale.
 */
export function cursorPosition(
  barIndex: number,
  progress: number,
  layout: CursorLayout,
  metrics: CursorMetrics,
  heightUnits = 80,
): CursorPlacement {
  const system = Math.floor(barIndex / layout.barsPerSystem);
  const localBar = barIndex % layout.barsPerSystem;

  const xUnits =
    layout.padLeft +
    localBar * layout.staveWidth +
    clamp01(progress) * layout.staveWidth;
  const yUnits = layout.padTop + system * layout.systemHeight;

  return {
    left: metrics.offsetX + xUnits * metrics.scale,
    top: metrics.offsetY + yUnits * metrics.scale,
    height: heightUnits * metrics.scale,
    system,
  };
}
