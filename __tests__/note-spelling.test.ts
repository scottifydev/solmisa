import { describe, it, expect } from "vitest";
import { buildKeyContext, spellNote } from "@/lib/midi/quantizer";

/** Spell a run of MIDI notes as if they were all in one bar. */
function spellBar(keySignature: string, midis: number[]) {
  const key = buildKeyContext(keySignature);
  const bar = new Map<string, number>();
  return midis.map((m) => spellNote(m, key, bar));
}

describe("buildKeyContext", () => {
  it("reads flat keys as flats", () => {
    const key = buildKeyContext("Eb");
    expect(key.prefersFlats).toBe(true);
    expect(key.alterations).toEqual({ b: -1, e: -1, a: -1 });
  });

  it("reads sharp keys as sharps", () => {
    const key = buildKeyContext("D");
    expect(key.prefersFlats).toBe(false);
    expect(key.alterations).toEqual({ f: 1, c: 1 });
  });

  it("treats C major as having no alterations", () => {
    expect(buildKeyContext("C").alterations).toEqual({});
  });

  it("strips the minor marker so spelling matches the drawn signature", () => {
    // NotationView draws `keySignature.replace("m", "")`, so "Gm" must be read
    // the same way here or the notes would contradict the stave.
    expect(buildKeyContext("Gm").alterations).toEqual(
      buildKeyContext("G").alterations,
    );
  });

  it("falls back to no alterations for an unrecognised key", () => {
    expect(buildKeyContext(undefined).alterations).toEqual({});
    expect(buildKeyContext("H").alterations).toEqual({});
  });
});

describe("spellNote in a flat key", () => {
  // Eb major: B, E and A are flattened by the signature.
  it("needs no accidental for notes the signature already alters", () => {
    const [eFlat, bFlat, aFlat] = spellBar("Eb", [63, 70, 68]);
    expect(eFlat).toEqual({ vexKey: "e/4", accidental: undefined });
    expect(bFlat).toEqual({ vexKey: "b/4", accidental: undefined });
    expect(aFlat).toEqual({ vexKey: "a/4", accidental: undefined });
  });

  it("emits a natural when a note contradicts the signature", () => {
    // This is the Autumn Leaves bar-1 defect: without a natural sign, VexFlow
    // renders B natural under the Eb signature as B flat, a different pitch.
    const [bNatural, eNatural, aNatural] = spellBar("Eb", [71, 64, 69]);
    expect(bNatural).toEqual({ vexKey: "b/4", accidental: "n" });
    expect(eNatural).toEqual({ vexKey: "e/4", accidental: "n" });
    expect(aNatural).toEqual({ vexKey: "a/4", accidental: "n" });
  });

  it("needs no accidental for unaltered white notes", () => {
    const [c, d] = spellBar("Eb", [60, 62]);
    expect(c).toEqual({ vexKey: "c/4", accidental: undefined });
    expect(d).toEqual({ vexKey: "d/4", accidental: undefined });
  });

  it("spells black notes as flats", () => {
    const [gFlat] = spellBar("Eb", [66]);
    expect(gFlat).toEqual({ vexKey: "g/4", accidental: "b" });
  });
});

describe("spellNote in a sharp key", () => {
  it("needs no accidental for signature sharps", () => {
    // D major: F# and C#.
    const [fSharp, cSharp] = spellBar("D", [66, 61]);
    expect(fSharp).toEqual({ vexKey: "f/4", accidental: undefined });
    expect(cSharp).toEqual({ vexKey: "c/4", accidental: undefined });
  });

  it("emits a natural when a note contradicts the signature", () => {
    const [fNatural] = spellBar("D", [65]);
    expect(fNatural).toEqual({ vexKey: "f/4", accidental: "n" });
  });

  it("spells other black notes as sharps", () => {
    const [gSharp] = spellBar("D", [68]);
    expect(gSharp).toEqual({ vexKey: "g/4", accidental: "#" });
  });
});

describe("accidentals within a bar", () => {
  it("does not repeat an accidental already in force", () => {
    const [first, second] = spellBar("Eb", [71, 71]);
    expect(first?.accidental).toBe("n");
    expect(second?.accidental).toBeUndefined();
  });

  it("restores the signature pitch after an accidental in the same bar", () => {
    // E natural, then E flat: the flat must be restated or the second note
    // would read as another E natural.
    const [eNatural, eFlat] = spellBar("Eb", [64, 63]);
    expect(eNatural?.accidental).toBe("n");
    expect(eFlat).toEqual({ vexKey: "e/4", accidental: "b" });
  });

  it("scopes accidentals to one octave", () => {
    // A natural in one octave leaves the signature in force an octave up.
    const [lower, upper] = spellBar("Eb", [69, 81]);
    expect(lower).toEqual({ vexKey: "a/4", accidental: "n" });
    expect(upper).toEqual({ vexKey: "a/5", accidental: "n" });
  });

  it("starts each bar from the key signature again", () => {
    expect(spellBar("Eb", [71])[0]?.accidental).toBe("n");
    expect(spellBar("Eb", [71])[0]?.accidental).toBe("n");
  });
});

describe("octave numbering", () => {
  it("keeps a flat in the same octave as its natural", () => {
    const [bFlat, bNatural] = spellBar("Eb", [70, 71]);
    expect(bFlat?.vexKey).toBe("b/4");
    expect(bNatural?.vexKey).toBe("b/4");
  });

  it("keeps a sharp in the same octave as its natural", () => {
    // C major has no flats in its signature, so black notes spell as sharps.
    const [aSharp, aNatural] = spellBar("C", [70, 69]);
    expect(aSharp).toEqual({ vexKey: "a/4", accidental: "#" });
    expect(aNatural).toEqual({ vexKey: "a/4", accidental: "n" });
  });

  it("uses scientific pitch notation for middle C", () => {
    expect(spellBar("C", [60])[0]?.vexKey).toBe("c/4");
  });
});
