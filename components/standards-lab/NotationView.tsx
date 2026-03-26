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
import type { OverlayState } from "./OverlayToggles";

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
  const [overlays, setOverlays] = useState<OverlayState>({
    guideTones: false,
    gravity: false,
    beatGrid: false,
    voicingStaff: false,
  });

  return (
    <div>
      {/* SCO-471 #3: Compact single-row toggle bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: 8,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid #2e2e3e",
          width: "fit-content",
          height: 32,
        }}
      >
        {/* View mode selector */}
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as ViewMode)}
          style={{
            background: "#1a1a24",
            color: CHORD_COLOR,
            border: "none",
            borderRight: "1px solid #2e2e3e",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            padding: "0 10px",
            height: "100%",
            cursor: "pointer",
          }}
        >
          <option value="lead-chords">Lead+Chords</option>
          <option value="lead-only">Lead Only</option>
          <option value="chords-only">Chord Chart</option>
        </select>

        {/* Overlay toggles inline — only for staff views */}
        {viewMode !== "chords-only" && (
          <>
            {[
              { key: "guideTones" as const, label: "GT" },
              { key: "gravity" as const, label: "CT" },
              { key: "voicingStaff" as const, label: "VS" },
              { key: "beatGrid" as const, label: "BG" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setOverlays((s) => ({ ...s, [key]: !s[key] }))}
                style={{
                  padding: "0 10px",
                  height: "100%",
                  background: overlays[key] ? "#1a1a24" : "transparent",
                  color: overlays[key] ? CHORD_COLOR : "#555",
                  border: "none",
                  borderRight: "1px solid #2e2e3e",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: overlays[key] ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </>
        )}
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
          chords={chords}
          currentBar={currentBar}
          showChords={viewMode === "lead-chords"}
          showDegreeColors={viewMode === "lead-chords"}
          overlays={overlays}
        />
      )}
    </div>
  );
}

// ─── Staff View (Lead+Chords / Lead Only) ────────────────────

function StaffView({
  notation,
  chords,
  currentBar,
  showChords,
  showDegreeColors,
  overlays,
}: {
  notation: StandardNotation;
  chords: AnalyzedChord[];
  currentBar?: number;
  showChords: boolean;
  showDegreeColors: boolean;
  overlays: OverlayState;
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
    const systemHeight = overlays.voicingStaff
      ? STAVE_HEIGHT + 100
      : STAVE_HEIGHT;
    const totalHeight = PAD_TOP + systemHeight * systemCount + 40;

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(totalWidth, totalHeight);
    const context = renderer.getContext();
    context.setFillStyle(STAFF_COLOR);
    context.setStrokeStyle(STAFF_COLOR);

    for (let sys = 0; sys < systemCount; sys++) {
      const startBar = sys * BARS_PER_SYSTEM;
      const endBar = Math.min(startBar + BARS_PER_SYSTEM, measures.length);
      const y = PAD_TOP + sys * systemHeight;

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
          overlays.gravity,
        );

        // Beat grid overlay
        if (overlays.beatGrid) {
          const beats = timeSignature?.numerator ?? 4;
          const beatWidth = STAVE_WIDTH / beats;
          for (let b = 0; b < beats; b++) {
            const bx =
              x +
              b * beatWidth +
              (isFirst
                ? ((
                    context as unknown as {
                      stave?: { getModifierXShift?: () => number };
                    }
                  ).stave?.getModifierXShift?.() ?? 40)
                : 0);
            context.save();
            context.setStrokeStyle(b % 2 === 0 ? "#2a2a30" : "#1e1e24");
            context.setLineWidth(1);
            context.beginPath();
            context.moveTo(x + b * beatWidth, y);
            context.lineTo(x + b * beatWidth, y + 80);
            context.stroke();
            context.restore();
          }
        }

        // Voicing staff
        if (overlays.voicingStaff) {
          const voicingY = y + 95;
          const vStave = new Stave(x, voicingY, STAVE_WIDTH);
          if (isFirst) vStave.addClef("bass");
          vStave.setBegBarType(Barline.type.NONE);
          vStave.setStyle({ fillStyle: "#1e1e24", strokeStyle: "#1e1e24" });
          vStave.setContext(context);
          vStave.draw();

          // Render voicing notes for this bar
          const barChord = chords.find((c) => c.bar === barIdx);
          if (barChord && barChord.notes.length > 0) {
            const vexKeys = barChord.notes.map((midi) => {
              const oct = Math.floor(midi / 12) - 1;
              const names = [
                "c",
                "c",
                "d",
                "d",
                "e",
                "f",
                "f",
                "g",
                "g",
                "a",
                "a",
                "b",
              ];
              return `${names[midi % 12]}/${oct}`;
            });
            try {
              const vNote = new StaveNote({
                keys: vexKeys,
                duration: "w",
                clef: "bass",
              });
              const rootPc = barChord.rootMidi % 12;
              for (let ki = 0; ki < barChord.notes.length; ki++) {
                const notePc = barChord.notes[ki]! % 12;
                if (notePc === rootPc) {
                  vNote.setKeyStyle(ki, {
                    fillStyle: "#F0997B",
                    strokeStyle: "#F0997B",
                  });
                } else {
                  vNote.setKeyStyle(ki, {
                    fillStyle: "#7F77DD",
                    strokeStyle: "#7F77DD",
                  });
                }
                // Accidentals
                const acc = [
                  null,
                  "#",
                  null,
                  "#",
                  null,
                  null,
                  "#",
                  null,
                  "#",
                  null,
                  "#",
                  null,
                ][notePc];
                if (acc) vNote.addModifier(new Accidental(acc), ki);
              }
              const voice = new Voice({ numBeats: 4, beatValue: 4 });
              voice.setMode(Voice.Mode.SOFT);
              voice.addTickables([vNote]);
              new Formatter()
                .joinVoices([voice])
                .format([voice], STAVE_WIDTH - 60);
              voice.draw(context, vStave);
            } catch {
              // Skip if VexFlow can't render
            }
          }
        }
      }
    }

    // Post-render: fix black SVG elements + apply gravity opacity
    const svg = el.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "auto";
      svg.setAttribute("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
      fixBlackSvgElements(svg);

      // Gravity effect: dim notes with data-gravity="weak" attribute
      if (overlays.gravity) {
        applyGravityEffect(svg);
      }

      // Guide tone arcs
      if (overlays.guideTones && chords.length > 1) {
        drawGuideToneArcs(svg, chords, measures, totalWidth);
      }
    }
  }, [notation, chords, currentBar, showChords, showDegreeColors, overlays]);

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
  gravityMode?: boolean,
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

  // Current bar highlight + amber cursor line (SCO-474 #2)
  if (isCurrentBar) {
    context.save();
    context.setFillStyle("#f0c97a0c");
    context.fillRect(x, y, width, 80);
    // 2px amber cursor line with glow
    context.setStrokeStyle("#f0c97a");
    context.setLineWidth(2);
    context.beginPath();
    context.moveTo(x + 2, y);
    context.lineTo(x + 2, y + 80);
    context.stroke();
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
    buildStaveNote(note, showDegreeColors, gravityMode),
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
  gravityMode?: boolean,
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

  // Gravity: weak beats (2, 4) get 25% opacity
  const isWeakBeat =
    gravityMode &&
    !note.rest &&
    (note.beat === 2 ||
      note.beat === 2.5 ||
      note.beat === 4 ||
      note.beat === 4.5);

  if (note.rest) {
    staveNote.setStyle({ fillStyle: STAFF_COLOR, strokeStyle: STAFF_COLOR });
  } else if (showDegreeColors && note.noteCategory) {
    let color = DEGREE_COLORS[note.noteCategory];
    if (isWeakBeat) color = color + "40"; // 25% opacity via hex alpha
    staveNote.setStyle({ fillStyle: color, strokeStyle: color });
  } else {
    const color = isWeakBeat ? NOTE_COLOR + "40" : NOTE_COLOR;
    staveNote.setStyle({ fillStyle: color, strokeStyle: color });
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

// ─── Gravity Effect ──────────────────────────────────────────

function applyGravityEffect(_svg: SVGSVGElement) {
  // Gravity is already applied via buildStaveNote with hex alpha
  // This hook exists for future post-render adjustments
}

// ─── Guide Tone Arcs ─────────────────────────────────────────

const THIRD_ARC_COLOR = "#d4a0d4";
const SEVENTH_ARC_COLOR = "#a0d4d4";

function drawGuideToneArcs(
  svg: SVGSVGElement,
  chords: AnalyzedChord[],
  measures: QuantizedMeasure[],
  _totalWidth: number,
) {
  // Create an SVG group for arcs
  const ns = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(ns, "g");
  g.setAttribute("class", "guide-tone-arcs");

  for (let i = 0; i < chords.length - 1; i++) {
    const curr = chords[i]!;
    const next = chords[i + 1]!;

    const currBar = curr.bar;
    const nextBar = next.bar;
    if (nextBar >= measures.length) continue;

    // 3rd of current chord → 3rd of next chord
    const curr3rd = (curr.rootMidi + 4) % 12; // major 3rd
    const next3rd =
      (next.rootMidi +
        ([
          "min",
          "min7",
          "min9",
          "min11",
          "min6",
          "min7b5",
          "dim",
          "dim7",
        ].includes(next.quality)
          ? 3
          : 4)) %
      12;

    // 7th of current chord → 7th of next chord
    const curr7th =
      (curr.rootMidi + (["maj7", "maj9"].includes(curr.quality) ? 11 : 10)) %
      12;
    const next7th =
      (next.rootMidi + (["maj7", "maj9"].includes(next.quality) ? 11 : 10)) %
      12;

    // Estimate x positions from bar numbers
    const system1 = Math.floor(currBar / BARS_PER_SYSTEM);
    const system2 = Math.floor(nextBar / BARS_PER_SYSTEM);
    if (system1 !== system2) continue; // skip cross-system arcs

    const localBar1 = currBar % BARS_PER_SYSTEM;
    const localBar2 = nextBar % BARS_PER_SYSTEM;
    const x1 = PAD_LEFT + localBar1 * STAVE_WIDTH + STAVE_WIDTH * 0.8;
    const x2 = PAD_LEFT + localBar2 * STAVE_WIDTH + STAVE_WIDTH * 0.2;
    const systemHeight = STAVE_HEIGHT;
    const yBase = PAD_TOP + system1 * systemHeight;

    // 3rd arc (above staff)
    const y3 = yBase + 20;
    const arc3 = document.createElementNS(ns, "path");
    const cy3 = y3 - 15;
    arc3.setAttribute(
      "d",
      `M ${x1} ${y3} Q ${(x1 + x2) / 2} ${cy3} ${x2} ${y3}`,
    );
    arc3.setAttribute("fill", "none");
    arc3.setAttribute("stroke", THIRD_ARC_COLOR);
    arc3.setAttribute("stroke-width", "1.5");
    arc3.setAttribute("opacity", "0.6");
    g.appendChild(arc3);

    // Dots at endpoints
    const dot3a = document.createElementNS(ns, "circle");
    dot3a.setAttribute("cx", String(x1));
    dot3a.setAttribute("cy", String(y3));
    dot3a.setAttribute("r", "3");
    dot3a.setAttribute("fill", THIRD_ARC_COLOR);
    dot3a.setAttribute("opacity", "0.6");
    g.appendChild(dot3a);

    const dot3b = document.createElementNS(ns, "circle");
    dot3b.setAttribute("cx", String(x2));
    dot3b.setAttribute("cy", String(y3));
    dot3b.setAttribute("r", "3");
    dot3b.setAttribute("fill", THIRD_ARC_COLOR);
    dot3b.setAttribute("opacity", "0.6");
    g.appendChild(dot3b);

    // Label
    const label3 = document.createElementNS(ns, "text");
    label3.setAttribute("x", String(x1 - 8));
    label3.setAttribute("y", String(y3 + 4));
    label3.setAttribute("fill", THIRD_ARC_COLOR);
    label3.setAttribute("font-size", "9");
    label3.setAttribute("font-family", "DM Sans, sans-serif");
    label3.setAttribute("opacity", "0.6");
    label3.textContent = "3";
    g.appendChild(label3);

    // 7th arc (below staff)
    const y7 = yBase + 75;
    const arc7 = document.createElementNS(ns, "path");
    const cy7 = y7 + 15;
    arc7.setAttribute(
      "d",
      `M ${x1} ${y7} Q ${(x1 + x2) / 2} ${cy7} ${x2} ${y7}`,
    );
    arc7.setAttribute("fill", "none");
    arc7.setAttribute("stroke", SEVENTH_ARC_COLOR);
    arc7.setAttribute("stroke-width", "1.5");
    arc7.setAttribute("opacity", "0.6");
    g.appendChild(arc7);

    const dot7a = document.createElementNS(ns, "circle");
    dot7a.setAttribute("cx", String(x1));
    dot7a.setAttribute("cy", String(y7));
    dot7a.setAttribute("r", "3");
    dot7a.setAttribute("fill", SEVENTH_ARC_COLOR);
    dot7a.setAttribute("opacity", "0.6");
    g.appendChild(dot7a);

    const dot7b = document.createElementNS(ns, "circle");
    dot7b.setAttribute("cx", String(x2));
    dot7b.setAttribute("cy", String(y7));
    dot7b.setAttribute("r", "3");
    dot7b.setAttribute("fill", SEVENTH_ARC_COLOR);
    dot7b.setAttribute("opacity", "0.6");
    g.appendChild(dot7b);

    const label7 = document.createElementNS(ns, "text");
    label7.setAttribute("x", String(x1 - 8));
    label7.setAttribute("y", String(y7 + 4));
    label7.setAttribute("fill", SEVENTH_ARC_COLOR);
    label7.setAttribute("font-size", "9");
    label7.setAttribute("font-family", "DM Sans, sans-serif");
    label7.setAttribute("opacity", "0.6");
    label7.textContent = "7";
    g.appendChild(label7);
  }

  svg.appendChild(g);
}
