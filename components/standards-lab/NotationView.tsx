"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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
  ViewMode,
  AnalyzedChord,
} from "@/types/standards-lab";
import { ChordChart } from "./ChordChart";

// ─── SCO-468 Colors (exact spec) ─────────────────────────────

const STAFF_COLOR = "#2a2a30";
const NOTE_COLOR = "#e0ddd4";
const CHORD_COLOR = "#f0c97a";
const BAR_NUMBER_COLOR = "#888";
const SECTION_COLOR = "#AFA9EC";

const DEGREE_COLORS: Record<NoteCategory, string> = {
  root: "#F0997B",
  "chord-tone": "#85B7EB",
  tension: "#5DCAA5",
  avoid: "#F09595",
  chromatic: "#e0ddd4",
};

// ─── Layout ──────────────────────────────────────────────────

const BARS_PER_SYSTEM = 4;
const STAVE_WIDTH = 320;
const STAVE_HEIGHT = 150;
const PAD_LEFT = 50;
const PAD_TOP = 55;

// ─── Component ───────────────────────────────────────────────

interface NotationViewProps {
  notation: StandardNotation;
  chords: AnalyzedChord[];
  currentBar?: number;
}

export function NotationView({
  notation,
  chords,
  currentBar,
}: NotationViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("lead-chords");

  return (
    <div>
      {/* View mode toggle */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 10,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #2e2e3e",
          width: "fit-content",
        }}
      >
        {[
          { mode: "lead-chords" as ViewMode, label: "Lead + Chords" },
          { mode: "lead-only" as ViewMode, label: "Lead Only" },
          { mode: "chords-only" as ViewMode, label: "Chord Chart" },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: "6px 16px",
              background: viewMode === mode ? "#1a1a24" : "transparent",
              color: viewMode === mode ? CHORD_COLOR : "#888",
              border: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: viewMode === mode ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              borderRight: "1px solid #2e2e3e",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Render based on mode */}
      {viewMode === "chords-only" ? (
        <ChordChart
          notation={notation}
          chords={chords}
          currentBar={currentBar}
        />
      ) : (
        <StaffView
          notation={notation}
          currentBar={currentBar}
          showChords={viewMode === "lead-chords"}
          showDegreeColors={viewMode === "lead-chords"}
        />
      )}
    </div>
  );
}

// ─── Staff View (Lead+Chords / Lead Only) ────────────────────

function StaffView({
  notation,
  currentBar,
  showChords,
  showDegreeColors,
}: {
  notation: StandardNotation;
  currentBar?: number;
  showChords: boolean;
  showDegreeColors: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const { measures, keySignature, timeSignature } = notation;
    if (measures.length === 0) return;

    const systemCount = Math.ceil(measures.length / BARS_PER_SYSTEM);
    const totalWidth = PAD_LEFT + STAVE_WIDTH * BARS_PER_SYSTEM + 20;
    const totalHeight = PAD_TOP + STAVE_HEIGHT * systemCount + 40;

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();
    context.setFillStyle(STAFF_COLOR);
    context.setStrokeStyle(STAFF_COLOR);

    for (let sys = 0; sys < systemCount; sys++) {
      const startBar = sys * BARS_PER_SYSTEM;
      const endBar = Math.min(startBar + BARS_PER_SYSTEM, measures.length);
      const y = PAD_TOP + sys * STAVE_HEIGHT;

      for (let barIdx = startBar; barIdx < endBar; barIdx++) {
        const localIdx = barIdx - startBar;
        const x = PAD_LEFT + localIdx * STAVE_WIDTH;
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
          showChords,
          showDegreeColors,
        );
      }
    }

    // Post-render: fix any remaining black SVG elements
    const svg = el.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
      fixBlackSvgElements(svg);
    }
  }, [notation, currentBar, showChords, showDegreeColors]);

  useEffect(() => {
    render();
  }, [render]);

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

// ─── Fix Black SVG Elements ──────────────────────────────────

function fixBlackSvgElements(svg: SVGSVGElement) {
  svg.querySelectorAll("*").forEach((node) => {
    const el = node as SVGElement;
    const s = el.style;

    // Inline style black → staff color
    if (
      s.fill === "black" ||
      s.fill === "#000000" ||
      s.fill === "rgb(0, 0, 0)"
    ) {
      s.fill = STAFF_COLOR;
    }
    if (
      s.stroke === "black" ||
      s.stroke === "#000000" ||
      s.stroke === "rgb(0, 0, 0)"
    ) {
      s.stroke = STAFF_COLOR;
    }

    // Attribute black → staff color
    const fill = el.getAttribute("fill");
    const stroke = el.getAttribute("stroke");
    if (fill === "#000000" || fill === "black")
      el.setAttribute("fill", STAFF_COLOR);
    if (stroke === "#000000" || stroke === "black")
      el.setAttribute("stroke", STAFF_COLOR);

    // No color at all → staff color (SVG defaults to black)
    if (
      el.tagName === "path" ||
      el.tagName === "line" ||
      el.tagName === "rect"
    ) {
      if (!fill && !stroke && !s.fill && !s.stroke) {
        el.setAttribute("fill", STAFF_COLOR);
        el.setAttribute("stroke", STAFF_COLOR);
      }
    }
  });
}

// ─── Measure Rendering ───────────────────────────────────────

function renderMeasure(
  context: ReturnType<Renderer["getContext"]>,
  measure: QuantizedMeasure,
  x: number,
  y: number,
  width: number,
  showClef: boolean,
  keySignature: string | undefined,
  timeSignature: { numerator: number; denominator: number } | undefined,
  isCurrentBar: boolean,
  showChords: boolean,
  showDegreeColors: boolean,
) {
  context.setFillStyle(STAFF_COLOR);
  context.setStrokeStyle(STAFF_COLOR);

  const stave = new Stave(x, y, width);
  if (showClef) stave.addClef("treble");
  if (keySignature) stave.addKeySignature(keySignature.replace("m", ""));
  if (timeSignature)
    stave.addTimeSignature(
      `${timeSignature.numerator}/${timeSignature.denominator}`,
    );
  stave.setBegBarType(Barline.type.NONE);
  stave.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR });
  stave.setContext(context);
  stave.draw();

  // Current bar highlight
  if (isCurrentBar) {
    context.save();
    context.setFillStyle("#f0c97a0c");
    context.fillRect(x, y, width, 80);
    context.restore();
  }

  // Bar number
  context.save();
  context.setFont("DM Sans", 9, "500");
  context.setFillStyle(BAR_NUMBER_COLOR);
  context.fillText(`${measure.barNumber + 1}`, x + 4, y - 4);
  context.restore();

  // Section marker with pill background
  if (measure.rehearsalMark) {
    context.save();
    const text = measure.rehearsalMark;
    context.setFont("Outfit", 13, "bold");
    context.setFillStyle("rgba(175,169,236,0.12)");
    context.fillRect(x + width - 28, y - 18, 24, 18);
    context.setFillStyle(SECTION_COLOR);
    context.fillText(text, x + width - 22, y - 4);
    context.restore();
  }

  // Build notes
  const vexNotes = measure.notes.map((note) =>
    buildStaveNote(note, showDegreeColors),
  );
  if (vexNotes.length === 0) return;

  // Chord symbols
  if (showChords && measure.chordSymbol) {
    const target =
      vexNotes.find((_, i) => !measure.notes[i]?.rest) ?? vexNotes[0];
    if (target) addChordSymbol(target, measure.chordSymbol);
  }

  const beats = timeSignature?.numerator ?? 4;
  const beatValue = timeSignature?.denominator ?? 4;
  const voice = new Voice({ numBeats: beats, beatValue });
  voice.setMode(Voice.Mode.SOFT);
  voice.addTickables(vexNotes);

  const beams = Beam.generateBeams(
    vexNotes.filter((n) => {
      const d = n.getDuration();
      return d === "8" || d === "16";
    }),
  );

  new Formatter()
    .joinVoices([voice])
    .format([voice], width - stave.getModifierXShift() - 20);

  voice.draw(context, stave);
  beams.forEach((b) => {
    b.setContext(context);
    b.draw();
  });
}

// ─── Note Building ───────────────────────────────────────────

function buildStaveNote(
  note: QuantizedNote,
  showDegreeColors: boolean,
): StaveNote {
  const dur = note.rest ? `${note.duration}r` : note.duration;
  const staveNote = new StaveNote({
    keys: note.keys,
    duration: dur,
    clef: "treble",
    autoStem: true,
  });

  if (note.accidental && !note.rest) {
    staveNote.addModifier(new Accidental(note.accidental), 0);
  }
  if (note.dotted) {
    Dot.buildAndAttach([staveNote], { all: true });
  }

  if (note.rest) {
    staveNote.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR });
  } else if (showDegreeColors && note.noteCategory) {
    const color = DEGREE_COLORS[note.noteCategory];
    staveNote.setStyle({ fillStyle: color, strokeStyle: color });
  } else {
    staveNote.setStyle({ fillStyle: NOTE_COLOR, strokeStyle: NOTE_COLOR });
  }

  return staveNote;
}

// ─── Chord Symbols ───────────────────────────────────────────

function addChordSymbol(note: StaveNote, symbol: string): void {
  const cs = new ChordSymbol();
  const match = symbol.match(/^([A-G][b#]?)(.*)/);
  if (!match) return;

  cs.addText(match[1]!);
  if (match[2]) {
    cs.addText(match[2], { symbolModifier: SymbolModifiers.SUPERSCRIPT });
  }

  cs.setHorizontal(ChordSymbol.HorizontalJustify.LEFT);
  cs.setVertical(ChordSymbol.VerticalJustify.TOP);
  cs.setFont("DM Sans", 12);
  cs.setStyle({ fillStyle: CHORD_COLOR, strokeStyle: CHORD_COLOR });
  note.addModifier(cs);
}
