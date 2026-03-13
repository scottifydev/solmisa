"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Treble clef staff position → note name with register
// Position 0 = E4 (bottom line), positive = up, negative = below
export const TREBLE_POSITIONS: Record<number, string> = {
  "-2": "C4",
  "-1": "D4",
  "0": "E4",
  "1": "F4",
  "2": "G4",
  "3": "A4",
  "4": "B4",
  "5": "C5",
  "6": "D5",
  "7": "E5",
  "8": "F5",
};

const NOTE_TO_POS: Record<string, number> = Object.fromEntries(
  Object.entries(TREBLE_POSITIONS).map(([pos, note]) => [note, Number(pos)]),
);

async function renderStaffBase(
  container: HTMLDivElement,
  placedPos: number | null,
  placedColor: string,
  ghostPos: number | null,
  correctPos: number | null,
) {
  const { Renderer, Stave } = await import("vexflow");

  container.innerHTML = "";

  const W = 300;
  const H = 140;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(W, H);

  const context = renderer.getContext();
  context.setFillStyle("#3a3a4e");
  context.setStrokeStyle("#3a3a4e");

  const stave = new Stave(10, 30, W - 20);
  stave.addClef("treble");
  stave.setStyle({ fillStyle: "#3a3a4e", strokeStyle: "#3a3a4e" });
  stave.setContext(context);
  stave.draw();

  const svgRaw = container.querySelector("svg");
  if (!svgRaw) return;
  const svg = svgRaw; // non-null for closures below

  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.filter = "drop-shadow(0 0 4px rgba(139,92,246,0.2))";

  // Staff geometry — get from VexFlow metrics
  const yLine0 = stave.getYForLine(0); // top line
  const yLine4 = stave.getYForLine(4); // bottom line
  const sp = (yLine4 - yLine0) / 4; // space between lines

  // pos 0 = E4 = bottom line (line index 4)
  // pos 2 = G4 = 4th line (line index 3)
  // etc.
  function posToY(pos: number): number {
    // pos 0 → yLine4, pos 2 → yLine3, pos 4 → yLine2, pos 6 → yLine1, pos 8 → yLine0
    return yLine4 - (pos * sp) / 2;
  }

  const noteX = 180; // center of staff
  const rx = 9;
  const ry = 6.5;

  // Helper: draw ellipse note
  function addNote(
    pos: number,
    color: string,
    opacity: number,
    withLedger = false,
  ) {
    const y = posToY(pos);

    // Ledger line for C4 (pos -2)
    if (withLedger && pos <= -2) {
      const ledger = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      ledger.setAttribute("x1", String(noteX - rx * 1.8));
      ledger.setAttribute("y1", String(posToY(-2)));
      ledger.setAttribute("x2", String(noteX + rx * 1.8));
      ledger.setAttribute("y2", String(posToY(-2)));
      ledger.setAttribute("stroke", color);
      ledger.setAttribute("stroke-width", "1.5");
      ledger.setAttribute("opacity", String(opacity));
      svg.appendChild(ledger);
    }

    const ellipse = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "ellipse",
    );
    ellipse.setAttribute("cx", String(noteX));
    ellipse.setAttribute("cy", String(y));
    ellipse.setAttribute("rx", String(rx));
    ellipse.setAttribute("ry", String(ry));
    ellipse.setAttribute("fill", color);
    ellipse.setAttribute("opacity", String(opacity));
    ellipse.setAttribute("transform", `rotate(-10, ${noteX}, ${y})`);
    if (color !== "#3a3a4e") {
      ellipse.setAttribute(
        "filter",
        `drop-shadow(0 0 4px ${color === "#4ade80" || color.startsWith("rgba(74") ? "rgba(74,222,128,0.4)" : color === "#f87171" ? "rgba(248,113,113,0.4)" : "rgba(139,92,246,0.4)"})`,
      );
    }
    svg.appendChild(ellipse);

    // Stem
    if (opacity > 0.3) {
      const stem = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      stem.setAttribute("x1", String(noteX + rx - 0.5));
      stem.setAttribute("y1", String(y - 1));
      stem.setAttribute("x2", String(noteX + rx - 0.5));
      stem.setAttribute("y2", String(y - sp * 2.5));
      stem.setAttribute("stroke", color);
      stem.setAttribute("stroke-width", "1.2");
      stem.setAttribute("opacity", String(opacity * 0.5));
      svg.appendChild(stem);
    }
  }

  // Ghost note (hover)
  if (ghostPos !== null && placedPos === null) {
    addNote(ghostPos, "#8b5cf6", 0.2, true);
  }

  // Placed note
  if (placedPos !== null) {
    addNote(placedPos, placedColor, 1, true);
  }

  // Correct position ghost (after wrong answer)
  if (correctPos !== null && placedPos !== null && placedPos !== correctPos) {
    addNote(correctPos, "#4ade80", 0.35, true);
  }
}

interface StaffInteractiveProps {
  correctNote: string; // e.g. "C4"
  onAnswer: (correct: boolean) => void;
}

export function StaffInteractive({
  correctNote,
  onAnswer,
}: StaffInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ghostPos, setGhostPos] = useState<number | null>(null);
  const [placedPos, setPlacedPos] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [placedColor, setPlacedColor] = useState("#8b5cf6");
  const svgMetrics = useRef<{
    yLine0: number;
    yLine4: number;
    sp: number;
    svgRect: DOMRect;
    svgH: number;
  } | null>(null);

  const correctPos = NOTE_TO_POS[correctNote] ?? 0;

  // Initial render
  useEffect(() => {
    if (containerRef.current) {
      renderStaffBase(containerRef.current, null, "#8b5cf6", null, null).then(
        () => captureMetrics(),
      );
    }
  }, []);

  function captureMetrics() {
    const container = containerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    // Approximate: from the VexFlow rendering at H=140, stave at y=30, 4 lines
    // We'll derive from SVG viewBox
    const vb = svg.getAttribute("viewBox")?.split(" ").map(Number) ?? [
      0, 0, 300, 140,
    ];
    const svgH = vb[3] ?? 140;
    // These are pixel coords in viewBox space
    // Stave at y=30, 5 lines, spacing ~10
    const yLine0 = 30;
    const sp = 10;
    const yLine4 = yLine0 + 4 * sp;
    svgMetrics.current = { yLine0, yLine4, sp, svgRect, svgH };
  }

  function clientYToPos(clientY: number): number {
    const metrics = svgMetrics.current;
    if (!metrics) return 0;
    const { yLine0, yLine4, sp, svgRect, svgH } = metrics;
    // Scale clientY to viewBox y
    const svgY = ((clientY - svgRect.top) / svgRect.height) * svgH;
    // pos 0 = yLine4, pos increases upward
    const rawPos = ((yLine4 - svgY) / sp) * 2;
    const clamped = Math.max(-2, Math.min(8, Math.round(rawPos)));
    return clamped;
  }

  const rerender = useCallback(
    (ghost: number | null, placed: number | null, color: string) => {
      if (!containerRef.current) return;
      renderStaffBase(
        containerRef.current,
        placed,
        color,
        ghost,
        placed !== null && placed !== correctPos ? correctPos : null,
      ).then(() => captureMetrics());
    },
    [correctPos],
  );

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (answered || placedPos !== null) return;
    const pos = clientYToPos(e.clientY);
    setGhostPos(pos);
    rerender(pos, null, "#8b5cf6");
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (answered || placedPos !== null) return;
    const pos = clientYToPos(e.clientY);
    const isCorrect = pos === correctPos;
    const color = isCorrect ? "#4ade80" : "#f87171";
    setPlacedPos(pos);
    setGhostPos(null);
    setPlacedColor(color);
    setAnswered(true);
    rerender(null, pos, color);
    onAnswer(isCorrect);
  }

  function handleLeave() {
    if (placedPos !== null) return;
    setGhostPos(null);
    rerender(null, null, "#8b5cf6");
  }

  function handleIDontKnow() {
    if (answered) return;
    setPlacedPos(correctPos);
    setGhostPos(null);
    setPlacedColor("#4ade80");
    setAnswered(true);
    rerender(null, correctPos, "#4ade80");
    onAnswer(false);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: "100%",
      }}
    >
      {/* Hint text */}
      {!answered && (
        <div
          style={{
            fontSize: 11,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          Tap the correct position on the staff
        </div>
      )}

      {/* Staff */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          cursor: answered ? "default" : "crosshair",
          touchAction: "none",
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handleLeave}
      />

      {/* IDK */}
      {!answered && (
        <button
          onClick={handleIDontKnow}
          style={{
            background: "none",
            border: "none",
            color: "#3d3852",
            fontSize: 12,
            fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer",
            padding: "4px 12px",
          }}
        >
          I don&apos;t know yet
        </button>
      )}
    </div>
  );
}
