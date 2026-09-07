import { describe, it, expect } from "vitest";
import { decomposeBeats, buildNotation } from "@/lib/midi/quantizer";
import type {
  ParsedStandard,
  MidiNoteEvent,
  AnalyzedChord,
} from "@/types/standards-lab";

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

function sumBeats(parts: { vex: string; dotted: boolean }[]): number {
  return parts.reduce((t, p) => t + beatsOf(p.vex, p.dotted), 0);
}

describe("decomposeBeats", () => {
  it("returns a single duration when the span is on the grid", () => {
    expect(decomposeBeats(4)).toEqual([{ vex: "w", dotted: false, beats: 4 }]);
    expect(decomposeBeats(1)).toEqual([{ vex: "q", dotted: false, beats: 1 }]);
    expect(decomposeBeats(1.5)).toEqual([
      { vex: "q", dotted: true, beats: 1.5 },
    ]);
  });

  it("splits an off-grid span into parts that sum exactly", () => {
    // 2.5 beats matches no single duration. The old code emitted one quarter
    // note for this, losing 1.5 beats and leaving the bar short.
    const parts = decomposeBeats(2.5);
    expect(parts.length).toBeGreaterThan(1);
    expect(sumBeats(parts)).toBeCloseTo(2.5, 6);
  });

  it("sums exactly across every sixteenth-note span in a 4/4 bar", () => {
    for (let sixteenths = 1; sixteenths <= 16; sixteenths++) {
      const beats = sixteenths * 0.25;
      expect(sumBeats(decomposeBeats(beats))).toBeCloseTo(beats, 6);
    }
  });

  it("emits longest durations first", () => {
    const parts = decomposeBeats(3.5);
    const lengths = parts.map((p) => p.beats);
    expect([...lengths].sort((a, b) => b - a)).toEqual(lengths);
  });

  it("ignores spans shorter than the grid and invalid input", () => {
    expect(decomposeBeats(0)).toEqual([]);
    expect(decomposeBeats(0.1)).toEqual([]);
    expect(decomposeBeats(-3)).toEqual([]);
    expect(decomposeBeats(Number.NaN)).toEqual([]);
    expect(decomposeBeats(Number.POSITIVE_INFINITY)).toEqual([]);
  });
});

// ─── Bar assignment under a tempo change ─────────────────────

function note(bar: number, time: number, midi = 60): MidiNoteEvent {
  return {
    midi,
    name: "C4",
    pitch: "C",
    octave: 4,
    time,
    duration: 0.5,
    velocity: 0.8,
    ticks: 0,
    durationTicks: 0,
    bar,
  };
}

/**
 * A file that starts at 60bpm (4s bars) and doubles to 120bpm (2s bars) at
 * bar 2. Deriving bar length from the first tempo alone puts every later note
 * in the wrong measure, which is what the engraver used to do.
 */
function tempoChangeStandard(): ParsedStandard {
  const barStartTimes = [0, 4, 8, 10, 12];
  return {
    title: "Tempo Change",
    tracks: {
      melody: [note(0, 0), note(1, 4), note(2, 8), note(3, 10), note(4, 12)],
      harmony: [],
    },
    tempoEvents: [
      { ticks: 0, bpm: 60, time: 0 },
      { ticks: 1920, bpm: 120, time: 8 },
    ],
    timeSignature: { numerator: 4, denominator: 4 },
    keySignature: "C",
    durationSeconds: 14,
    totalBars: 5,
    ppq: 480,
    textEvents: [],
    barStartTimes,
  };
}

describe("buildNotation bar assignment", () => {
  it("places each note in the bar the parser assigned, across a tempo change", () => {
    const { measures } = buildNotation(tempoChangeStandard(), []);
    expect(measures).toHaveLength(5);
    // One sounding note per bar. Before the fix, notes after the tempo change
    // collapsed into earlier measures and later bars rendered empty.
    for (let bar = 0; bar < 5; bar++) {
      const sounding = measures[bar]!.notes.filter((n) => !n.rest);
      expect(sounding).toHaveLength(1);
    }
  });

  it("does not depend on the first tempo event", () => {
    const parsed = tempoChangeStandard();
    const withFirstTempoRemoved: ParsedStandard = {
      ...parsed,
      // Bar boundaries come from the tick-based map, so changing the reported
      // starting tempo must not move any note.
      tempoEvents: [{ ticks: 0, bpm: 999, time: 0 }],
    };
    const a = buildNotation(parsed, []);
    const b = buildNotation(withFirstTempoRemoved, []);
    expect(JSON.stringify(b.measures)).toBe(JSON.stringify(a.measures));
  });

  it("emits a measure per bar even when the melody is empty", () => {
    const parsed = tempoChangeStandard();
    const { measures } = buildNotation(
      { ...parsed, tracks: { melody: [], harmony: [] } },
      [],
    );
    expect(measures).toHaveLength(5);
    expect(measures.every((m) => m.notes.every((n) => n.rest))).toBe(true);
  });
});

describe("bar duration invariant", () => {
  it("every measure sums to the time signature", () => {
    const { measures } = buildNotation(tempoChangeStandard(), []);
    for (const measure of measures) {
      const total = measure.notes.reduce(
        (t, n) => t + beatsOf(n.duration, n.dotted),
        0,
      );
      expect(total).toBeCloseTo(4, 6);
    }
  });

  it("holds when notes start off the beat", () => {
    const parsed = tempoChangeStandard();
    const offbeat: ParsedStandard = {
      ...parsed,
      totalBars: 1,
      barStartTimes: [0, 4],
      tracks: {
        // Lands mid-bar, leaving an odd gap before and after.
        melody: [{ ...note(0, 1.5), duration: 0.5 }],
        harmony: [],
      },
    };
    const { measures } = buildNotation(offbeat, []);
    const total = measures[0]!.notes.reduce(
      (t, n) => t + beatsOf(n.duration, n.dotted),
      0,
    );
    expect(total).toBeCloseTo(4, 6);
  });
});

describe("chord attachment", () => {
  it("attaches the chord sounding at each bar's real start time", () => {
    const chords = [
      { symbol: "Cmaj7", time: 0, bar: 0 },
      { symbol: "Fmaj7", time: 8, bar: 2 },
    ] as unknown as AnalyzedChord[];
    const { measures } = buildNotation(tempoChangeStandard(), chords);
    expect(measures[0]!.chordSymbol).toBe("Cmaj7");
    expect(measures[1]!.chordSymbol).toBe("Cmaj7");
    // Bar 2 starts at 8s only under the tempo map; a fixed 4s bar would put
    // this chord in bar 1.
    expect(measures[2]!.chordSymbol).toBe("Fmaj7");
  });
});
