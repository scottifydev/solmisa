"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Accidental,
  Dot,
  Beam,
  ChordSymbol,
  SymbolModifiers,
  Barline,
} from "vexflow";
import type {
  StandardNotation,
  QuantizedMeasure,
  QuantizedNote,
  NoteCategory,
} from "@/types/standards-lab";

// ─── Theme ───────────────────────────────────────────────────

const STAFF_COLOR = "#555";
const NOTE_COLOR = "#e0ddd4";
const CHORD_COLOR = "#f0c97a";
const BAR_NUMBER_COLOR = "#666";
const REHEARSAL_COLOR = "#b794f6";

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  root: "#f87171",
  "chord-tone": "#60a5fa",
  tension: "#2dd4bf",
  avoid: "#ef4444",
  chromatic: "#e0ddd4",
};

// ─── Layout Constants ────────────────────────────────────────

const BARS_PER_SYSTEM = 4;
const STAVE_WIDTH = 320;
const STAVE_HEIGHT = 150;
const SYSTEM_PADDING_LEFT = 50;
const SYSTEM_PADDING_TOP = 55;

// ─── Component ───────────────────────────────────────────────

interface NotationViewProps {
  notation: StandardNotation;
  currentBar?: number;
}

export function NotationView({ notation, currentBar }: NotationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderNotation = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous
    el.innerHTML = "";

    const { measures, keySignature, timeSignature } = notation;
    if (measures.length === 0) return;

    const systemCount = Math.ceil(measures.length / BARS_PER_SYSTEM);
    const totalWidth = SYSTEM_PADDING_LEFT + STAVE_WIDTH * BARS_PER_SYSTEM + 20;
    const totalHeight = SYSTEM_PADDING_TOP + STAVE_HEIGHT * systemCount + 40;

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();

    for (let sys = 0; sys < systemCount; sys++) {
      const startBar = sys * BARS_PER_SYSTEM;
      const endBar = Math.min(startBar + BARS_PER_SYSTEM, measures.length);
      const y = SYSTEM_PADDING_TOP + sys * STAVE_HEIGHT;

      for (let barIdx = startBar; barIdx < endBar; barIdx++) {
        const localIdx = barIdx - startBar;
        const x = SYSTEM_PADDING_LEFT + localIdx * STAVE_WIDTH;
        const measure = measures[barIdx]!;
        const isFirst = localIdx === 0;

        renderMeasure(
          context,
          measure,
          x,
          y,
          STAVE_WIDTH,
          isFirst,
          isFirst ? keySignature : undefined,
          isFirst && sys === 0 ? timeSignature : undefined,
          barIdx === currentBar,
        );
      }
    }

    // Style the SVG — force dark theme colors on all VexFlow elements
    const svg = el.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);

      // Force staff lines, barlines, clefs, time sigs to light color
      // VexFlow renders these as <path> and <line> elements with inline stroke
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        .vf-stave path, .vf-stave line,
        .vf-barline path, .vf-barline line {
          stroke: ${STAFF_COLOR} !important;
          fill: ${STAFF_COLOR} !important;
        }
        .vf-clef path { fill: ${STAFF_COLOR} !important; }
        .vf-keysignature path { fill: ${STAFF_COLOR} !important; }
        .vf-timesig path { fill: ${STAFF_COLOR} !important; }
      `;
      svg.prepend(styleEl);

      // Brute-force: find all paths/lines without explicit color and set them
      svg.querySelectorAll("path, line, rect").forEach((el) => {
        const htmlEl = el as SVGElement;
        const fill = htmlEl.getAttribute("fill");
        const stroke = htmlEl.getAttribute("stroke");
        // If still default black, make it visible
        if (
          fill === "#000000" ||
          fill === "black" ||
          (fill === "none" && !stroke)
        ) {
          htmlEl.setAttribute("fill", STAFF_COLOR);
        }
        if (stroke === "#000000" || stroke === "black") {
          htmlEl.setAttribute("stroke", STAFF_COLOR);
        }
        // Elements with no fill/stroke at all
        if (!fill && !stroke) {
          htmlEl.setAttribute("fill", STAFF_COLOR);
          htmlEl.setAttribute("stroke", STAFF_COLOR);
        }
      });
    }
  }, [notation, currentBar]);

  useEffect(() => {
    renderNotation();
  }, [renderNotation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "auto",
        borderRadius: 12,
        border: "1px solid #2e2e3e",
        background: "#0f0f16",
        padding: "8px 0",
      }}
    />
  );
}

// ─── Measure Rendering ───────────────────────────────────────

interface TimeSignatureInput {
  numerator: number;
  denominator: number;
}

function renderMeasure(
  context: ReturnType<Renderer["getContext"]>,
  measure: QuantizedMeasure,
  x: number,
  y: number,
  width: number,
  showClef: boolean,
  keySignature?: string,
  timeSignature?: TimeSignatureInput,
  isCurrentBar?: boolean,
) {
  const stave = new Stave(x, y, width);

  if (showClef) stave.addClef("treble");
  if (keySignature) stave.addKeySignature(keySignature.replace("m", ""));
  if (timeSignature) {
    stave.addTimeSignature(
      `${timeSignature.numerator}/${timeSignature.denominator}`,
    );
  }

  // End barline on last bar
  stave.setBegBarType(Barline.type.NONE);

  stave.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR });
  stave.setContext(context);
  stave.draw();

  // Current bar highlight
  if (isCurrentBar) {
    context.save();
    context.setFillStyle("rgba(183,148,246,0.06)");
    context.fillRect(x, y, width, 80);
    context.restore();
  }

  // Bar number
  context.save();
  context.setFont("DM Sans", 9);
  context.setFillStyle(BAR_NUMBER_COLOR);
  context.fillText(`${measure.barNumber + 1}`, x + 4, y - 4);
  context.restore();

  // Rehearsal mark
  if (measure.rehearsalMark) {
    context.save();
    context.setFont("Outfit", 14, "bold");
    context.setFillStyle(REHEARSAL_COLOR);
    context.fillText(measure.rehearsalMark, x + width - 20, y - 4);
    context.restore();
  }

  // Build VexFlow notes
  const vexNotes = measure.notes.map((note) => buildStaveNote(note));

  if (vexNotes.length === 0) return;

  // Add chord symbols to first non-rest note
  if (measure.chordSymbol) {
    const firstNote = vexNotes.find((_, i) => !measure.notes[i]?.rest);
    if (firstNote) {
      addChordSymbol(firstNote, measure.chordSymbol);
    } else if (vexNotes[0]) {
      addChordSymbol(vexNotes[0], measure.chordSymbol);
    }
  }

  // Create voice and format
  const beats = timeSignature?.numerator ?? 4;
  const beatValue = timeSignature?.denominator ?? 4;
  const voice = new Voice({ numBeats: beats, beatValue });
  voice.setMode(Voice.Mode.SOFT); // Don't throw on duration mismatch
  voice.addTickables(vexNotes);

  // Auto-beam 8th notes
  const beams = Beam.generateBeams(
    vexNotes.filter((n) => {
      const dur = n.getDuration();
      return dur === "8" || dur === "16";
    }),
  );

  const modifierShift = stave.getModifierXShift();
  new Formatter()
    .joinVoices([voice])
    .format([voice], width - modifierShift - 20);

  voice.draw(context, stave);

  beams.forEach((beam) => {
    beam.setContext(context);
    beam.draw();
  });
}

// ─── Note Building ───────────────────────────────────────────

function buildStaveNote(note: QuantizedNote): StaveNote {
  const dur = note.rest ? `${note.duration}r` : note.duration;

  const staveNote = new StaveNote({
    keys: note.keys,
    duration: dur,
    clef: "treble",
    autoStem: true,
  });

  // Accidental
  if (note.accidental && !note.rest) {
    staveNote.addModifier(new Accidental(note.accidental), 0);
  }

  // Dotted
  if (note.dotted) {
    Dot.buildAndAttach([staveNote], { all: true });
  }

  // Color by category
  if (!note.rest && note.noteCategory) {
    const color = CATEGORY_COLORS[note.noteCategory];
    staveNote.setStyle({ fillStyle: color, strokeStyle: color });
  } else if (!note.rest) {
    staveNote.setStyle({ fillStyle: NOTE_COLOR, strokeStyle: NOTE_COLOR });
  } else {
    staveNote.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR });
  }

  return staveNote;
}

// ─── Chord Symbols ───────────────────────────────────────────

function addChordSymbol(note: StaveNote, symbol: string): void {
  const cs = new ChordSymbol();

  // Parse chord symbol: root + suffix
  // e.g. "Bbm7" → root="Bb", suffix="m7"
  // e.g. "F#7" → root="F#", suffix="7"
  const match = symbol.match(/^([A-G][b#]?)(.*)/);
  if (!match) return;

  const root = match[1]!;
  const suffix = match[2] ?? "";

  cs.addText(root);
  if (suffix) {
    cs.addText(suffix, { symbolModifier: SymbolModifiers.SUPERSCRIPT });
  }

  cs.setHorizontal(ChordSymbol.HorizontalJustify.LEFT);
  cs.setVertical(ChordSymbol.VerticalJustify.TOP);
  cs.setFont("DM Sans", 12);
  cs.setStyle({ fillStyle: CHORD_COLOR, strokeStyle: CHORD_COLOR });

  note.addModifier(cs);
}
