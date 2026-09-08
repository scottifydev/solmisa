import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseMidiFromBuffer } from "@/lib/midi/parser";
import { buildNotation } from "@/lib/midi/quantizer";
import { detectChords, quantizeChordsToBar } from "@/lib/midi/chord-detector";
import { STANDARDS_CATALOG } from "@/data/standards/catalog";

/**
 * Runs the real pipeline over every shipped MIDI file.
 *
 * The synthetic fixtures in quantizer.test.ts were too uniform to catch bars
 * that overflowed the time signature: they used one note per bar with a length
 * that always fit. These assertions are over actual performance data, which is
 * where overlapping onsets and notes at the barline come from.
 */

const VEX_BEATS: Record<string, number> = {
  w: 4,
  h: 2,
  q: 1,
  "8": 0.5,
  "16": 0.25,
};

function beatsOf(vex: string, dotted: boolean): number {
  const base = VEX_BEATS[vex] ?? 0;
  return dotted ? base * 1.5 : base;
}

function loadStandard(midiUrl: string) {
  const file = join(process.cwd(), "public", midiUrl.replace(/^\//, ""));
  const buf = readFileSync(file);
  // Node Buffer views a pooled ArrayBuffer, so slice to this file's bytes.
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return parseMidiFromBuffer(ab as ArrayBuffer, "test");
}

function notationFor(tune: (typeof STANDARDS_CATALOG)[number]) {
  const full = loadStandard(tune.midiUrl);
  const maxBars = tune.bars;
  const parsed =
    maxBars && full.totalBars > maxBars
      ? {
          ...full,
          totalBars: maxBars,
          durationSeconds: full.barStartTimes[maxBars] ?? full.durationSeconds,
          barStartTimes: full.barStartTimes.slice(0, maxBars),
          tracks: {
            melody: full.tracks.melody.filter((n) => n.bar < maxBars),
            harmony: full.tracks.harmony.filter((n) => n.bar < maxBars),
          },
        }
      : full;

  const chords = quantizeChordsToBar(
    detectChords(parsed.tracks.harmony, parsed),
    parsed.totalBars,
  );
  return { parsed, notation: buildNotation(parsed, chords, tune.sections) };
}

describe("every shipped standard engraves correctly", () => {
  it("has a MIDI file for every catalogue entry", () => {
    for (const tune of STANDARDS_CATALOG) {
      expect(() => loadStandard(tune.midiUrl)).not.toThrow();
    }
  });

  it.each(STANDARDS_CATALOG.map((t) => [t.title, t] as const))(
    "%s: every bar sums to the time signature",
    (_title, tune) => {
      const { notation } = notationFor(tune);
      const beatsPerBar = notation.timeSignature.numerator;
      const overflowing: { bar: number; beats: number }[] = [];

      for (const measure of notation.measures) {
        const total = measure.notes.reduce(
          (t, n) => t + beatsOf(n.duration, n.dotted),
          0,
        );
        if (Math.abs(total - beatsPerBar) > 1e-6) {
          overflowing.push({ bar: measure.barNumber, beats: total });
        }
      }

      expect(overflowing).toEqual([]);
    },
  );

  it.each(STANDARDS_CATALOG.map((t) => [t.title, t] as const))(
    "%s: emits only renderable durations",
    (_title, tune) => {
      const allowed = new Set(Object.keys(VEX_BEATS));
      const { notation } = notationFor(tune);
      const bad = notation.measures
        .flatMap((m) => m.notes)
        .filter((n) => !allowed.has(n.duration))
        .map((n) => n.duration);
      expect(bad).toEqual([]);
    },
  );

  it.each(STANDARDS_CATALOG.map((t) => [t.title, t] as const))(
    "%s: renders one measure per bar",
    (_title, tune) => {
      const { parsed, notation } = notationFor(tune);
      expect(notation.measures).toHaveLength(parsed.totalBars);
    },
  );
});

describe("engraved notes stay in sync with what plays", () => {
  it.each(STANDARDS_CATALOG.map((t) => [t.title, t] as const))(
    "%s: keeps nearly every melody note that sounds",
    (_title, tune) => {
      const { parsed, notation } = notationFor(tune);
      const sounding = notation.measures
        .flatMap((m) => m.notes)
        .filter((n) => !n.rest).length;
      const played = parsed.tracks.melody.length;
      if (played === 0) return;

      // Notes merge only when two onsets land on the same sixteenth, which is
      // a genuine single-voice collision. The worst tune in the catalogue
      // currently keeps 91%, so this threshold is a real bound with room to
      // spare rather than a snapshot of today's number: an eighth-note grid
      // scores 81% here and must fail.
      expect(sounding).toBeGreaterThan(played * 0.88);
      expect(sounding).toBeLessThanOrEqual(played);
    },
  );
});
