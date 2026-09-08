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

/** Build a one-bar 4/4 score at 60bpm from raw (onset, duration) pairs. */
function oneBar(
  spans: { time: number; duration: number; midi?: number }[],
): ParsedStandard {
  const base = tempoChangeStandard();
  return {
    ...base,
    totalBars: 1,
    barStartTimes: [0, 4],
    tracks: {
      melody: spans.map((s) => ({
        ...note(0, s.time, s.midi ?? 60),
        duration: s.duration,
      })),
      harmony: [],
    },
  };
}

function barBeats(measure: { notes: { duration: string; dotted: boolean }[] }) {
  return measure.notes.reduce((t, n) => t + beatsOf(n.duration, n.dotted), 0);
}

describe("bar duration invariant", () => {
  it("every measure sums to the time signature", () => {
    const { measures } = buildNotation(tempoChangeStandard(), []);
    for (const measure of measures) {
      expect(barBeats(measure)).toBeCloseTo(4, 6);
    }
  });

  it("holds when a note starts off the beat", () => {
    const { measures } = buildNotation(
      oneBar([{ time: 1.5, duration: 0.5 }]),
      [],
    );
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });

  it("holds when a long note overlaps the next onset", () => {
    // The held note wants 2 beats but the next onset is 0.5 beats away.
    // Without a next-onset clamp the bar rendered more beats than it has.
    const { measures } = buildNotation(
      oneBar([
        { time: 1, duration: 2 },
        { time: 1.5, duration: 1 },
      ]),
      [],
    );
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });

  it("holds when two notes quantize onto the same slot", () => {
    // A rolled chord spread wider than the parser's onset window puts two
    // notes in the melody that snap to one slot.
    const { measures } = buildNotation(
      oneBar([
        { time: 1.02, duration: 1, midi: 60 },
        { time: 1.08, duration: 1, midi: 67 },
      ]),
      [],
    );
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
    const sounding = measures[0]!.notes.filter((n) => !n.rest);
    expect(sounding).toHaveLength(1);
    // The note that actually starts on the slot wins. Preferring the higher
    // pitch instead dragged a later note backwards onto an earlier position.
    expect(sounding[0]!.keys[0]).toBe("c/4");
  });

  it("keeps both notes of a sixteenth-apart run", () => {
    // Snapping to eighths merged these into one slot and discarded a note.
    const { measures } = buildNotation(
      oneBar([
        { time: 1, duration: 0.25 },
        { time: 1.25, duration: 0.25 },
      ]),
      [],
    );
    const sounding = measures[0]!.notes.filter((n) => !n.rest);
    expect(sounding).toHaveLength(2);
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });

  it("notates the gap to the next note, not how long the key was held", () => {
    // A run of eighths played detached, each released after 40% of its slot.
    // Taking the note-off literally engraved them as sixteenths separated by
    // rests. Only notes with a following onset are checked: the last note in
    // a bar genuinely is short, because nothing follows it.
    const { measures } = buildNotation(
      oneBar([
        { time: 0, duration: 0.2 },
        { time: 0.5, duration: 0.2 },
        { time: 1, duration: 0.2 },
        { time: 1.5, duration: 0.2 },
      ]),
      [],
    );
    const sounding = measures[0]!.notes.filter((n) => !n.rest);
    expect(sounding).toHaveLength(4);
    // The three with a successor fill their slot.
    expect(sounding.slice(0, 3).map((n) => n.duration)).toEqual([
      "8",
      "8",
      "8",
    ]);
  });

  it("still notates a genuine rest after a short note", () => {
    // Held for a quarter, then two beats of silence: the rest is real and
    // must survive the inter-onset rule.
    const { measures } = buildNotation(
      oneBar([
        { time: 0, duration: 1 },
        { time: 3, duration: 1 },
      ]),
      [],
    );
    const first = measures[0]!.notes.filter((n) => !n.rest)[0]!;
    expect(first.duration).toBe("q");
    expect(measures[0]!.notes.some((n) => n.rest)).toBe(true);
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });

  it("holds across a spread of onsets and lengths", () => {
    const cases: { time: number; duration: number }[][] = [
      [{ time: 0, duration: 4 }],
      [{ time: 0, duration: 0.25 }],
      [{ time: 3.75, duration: 1 }],
      [{ time: 0.5, duration: 2.5 }],
      [
        { time: 0, duration: 1 },
        { time: 2.5, duration: 3 },
      ],
      [
        { time: 0.25, duration: 0.3 },
        { time: 1.1, duration: 0.4 },
        { time: 3.4, duration: 2 },
      ],
    ];
    for (const spans of cases) {
      const { measures } = buildNotation(oneBar(spans), []);
      expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
    }
  });
});

describe("notes are never silently dropped", () => {
  it("keeps a note played just before the barline", () => {
    // Snapping used to round this onto the barline, where the remaining
    // space was zero and the note was discarded while still sounding.
    const { measures } = buildNotation(
      oneBar([{ time: 3.95, duration: 0.5 }]),
      [],
    );
    const sounding = measures[0]!.notes.filter((n) => !n.rest);
    expect(sounding).toHaveLength(1);
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });

  it("renders every distinct onset in a busy bar", () => {
    const spans = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((time) => ({
      time,
      duration: 0.5,
    }));
    const { measures } = buildNotation(oneBar(spans), []);
    const sounding = measures[0]!.notes.filter((n) => !n.rest);
    expect(sounding).toHaveLength(8);
    expect(barBeats(measures[0]!)).toBeCloseTo(4, 6);
  });
});

describe("every emitted duration is renderable", () => {
  it("only uses durations VexFlow understands", () => {
    const allowed = new Set(["w", "h", "q", "8", "16"]);
    const cases = [
      tempoChangeStandard(),
      oneBar([{ time: 0.5, duration: 2.5 }]),
      oneBar([
        { time: 1, duration: 2 },
        { time: 1.5, duration: 1 },
      ]),
    ];
    for (const parsed of cases) {
      for (const measure of buildNotation(parsed, []).measures) {
        for (const n of measure.notes) {
          expect(allowed.has(n.duration)).toBe(true);
        }
      }
    }
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
