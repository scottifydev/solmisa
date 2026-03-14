"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Standard treble clef accidental positions
// Position 0 = E4 (bottom line). Odd = spaces, even = lines.
export const SHARP_POSITIONS = [8, 5, 9, 6, 3, 7, 4];
export const FLAT_POSITIONS = [4, 7, 3, 6, 2, 5, 1];

async function renderKeySigStaff(
  container: HTMLDivElement,
  placed: { pos: number; color: string }[],
  accType: "sharp" | "flat" | null,
  hoverPos: number | null,
  ghostIdx: number,
  correctPositions: number[],
  showCorrectHints: boolean,
) {
  const { Renderer, Stave } = await import("vexflow");

  container.innerHTML = "";

  const W = 300;
  const H = 140;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(W, H);

  const context = renderer.getContext();
  const staffColor = accType ? "#3a3a4e" : "rgba(58,58,78,0.4)";
  context.setFillStyle(staffColor);
  context.setStrokeStyle(staffColor);

  const stave = new Stave(10, 30, W - 20);
  stave.addClef("treble");
  stave.setStyle({ fillStyle: staffColor, strokeStyle: staffColor });
  stave.setContext(context);
  stave.draw();

  const svgRaw = container.querySelector("svg");
  if (!svgRaw) return;
  const svg = svgRaw;

  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.filter = "drop-shadow(0 0 3px rgba(237,233,254,0.2))";

  const yLine0 = stave.getYForLine(0);
  const yLine4 = stave.getYForLine(4);
  const sp = (yLine4 - yLine0) / 4;
  const startX = 70;
  const accSpacing = 22;

  function posToY(pos: number): number {
    return yLine4 - (pos * sp) / 2;
  }

  const isSharpSym = accType === "sharp";
  const symStr = isSharpSym ? "♯" : "♭";

  function addAccidental(
    x: number,
    pos: number,
    color: string,
    opacity: number,
    symbol: string,
    isSharp: boolean,
  ) {
    const y = posToY(pos);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(x));
    text.setAttribute("y", String(y + (isSharp ? 6 : 8)));
    text.setAttribute("font-size", isSharp ? "22" : "26");
    text.setAttribute("fill", color);
    text.setAttribute("opacity", String(opacity));
    text.setAttribute(
      "font-family",
      "'Bravura','Academico','Noto Music',serif",
    );
    text.setAttribute(
      "style",
      `user-select:none; pointer-events:none; filter:drop-shadow(0 0 3px ${color === "#4ade80" ? "rgba(74,222,128,0.4)" : color === "#f87171" ? "rgba(248,113,113,0.4)" : "rgba(237,233,254,0.4)"})`,
    );
    text.textContent = symbol;
    svg.appendChild(text);
  }

  // Placed accidentals
  placed.forEach(({ pos, color }, i) => {
    addAccidental(startX + i * accSpacing, pos, color, 1, symStr, isSharpSym);
  });

  // Correct hint ghosts (after wrong answer)
  if (showCorrectHints && accType) {
    const finalIsSharp = accType === "sharp";
    const finalSym = finalIsSharp ? "♯" : "♭";
    correctPositions.forEach((pos, i) => {
      if (placed[i]?.color !== "#f87171") return; // only show hint for wrong ones
      addAccidental(
        startX + i * accSpacing,
        pos,
        "#4ade80",
        0.4,
        finalSym,
        finalIsSharp,
      );
    });
  }

  // Ghost hover preview for next placement
  if (accType && hoverPos !== null && placed.length < 7) {
    addAccidental(
      startX + placed.length * accSpacing,
      hoverPos,
      "#8b5cf6",
      0.2,
      symStr,
      isSharpSym,
    );
  }

  // Capture stave metrics for hit testing
  return { yLine0, yLine4, sp, startX, accSpacing };
}

export interface KeySigData {
  sharps: number;
  flats: number;
  major: string;
  minor: string;
}

interface KeySigPlacerProps {
  keySig: KeySigData;
  onComplete: (correct: boolean) => void;
}

export function KeySigPlacer({ keySig, onComplete }: KeySigPlacerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<{
    yLine0: number;
    yLine4: number;
    sp: number;
    startX: number;
    accSpacing: number;
    svgRect: DOMRect;
    svgH: number;
    svgW: number;
  } | null>(null);

  const expectedIsSharp = keySig.sharps > 0;
  const expectedCount = expectedIsSharp ? keySig.sharps : keySig.flats;
  const expectedPositions = expectedIsSharp
    ? SHARP_POSITIONS.slice(0, expectedCount)
    : FLAT_POSITIONS.slice(0, expectedCount);

  const [accType, setAccType] = useState<"sharp" | "flat" | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [placedColors, setPlacedColors] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);

  const rerender = useCallback(
    async (
      p: number[],
      colors: string[],
      hover: number | null,
      hints: boolean,
    ) => {
      if (!containerRef.current) return;
      const colored = p.map((pos, i) => ({
        pos,
        color: colors[i] ?? "#8b5cf6",
      }));
      const result = await renderKeySigStaff(
        containerRef.current,
        colored,
        accType,
        hover,
        p.length,
        expectedPositions,
        hints,
      );
      if (result && containerRef.current) {
        const svg = containerRef.current.querySelector("svg");
        if (svg) {
          const svgRect = svg.getBoundingClientRect();
          const vb = svg.getAttribute("viewBox")?.split(" ").map(Number) ?? [
            0, 0, 300, 140,
          ];
          metricsRef.current = {
            ...result,
            svgRect,
            svgH: vb[3] ?? 140,
            svgW: vb[2] ?? 300,
          };
        }
      }
    },
    [accType, expectedPositions],
  );

  // Initial render
  useEffect(() => {
    if (containerRef.current) {
      renderKeySigStaff(
        containerRef.current,
        [],
        accType,
        null,
        0,
        [],
        false,
      ).then((result) => {
        if (result && containerRef.current) {
          const svg = containerRef.current.querySelector("svg");
          if (svg) {
            const svgRect = svg.getBoundingClientRect();
            const vb = svg.getAttribute("viewBox")?.split(" ").map(Number) ?? [
              0, 0, 300, 140,
            ];
            metricsRef.current = {
              ...result,
              svgRect,
              svgH: vb[3] ?? 140,
              svgW: vb[2] ?? 300,
            };
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when accType or placed changes
  useEffect(() => {
    rerender(placed, placedColors, hoverPos, showHints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accType, placed, placedColors, hoverPos, showHints]);

  function clientToStaff(clientX: number, clientY: number) {
    const m = metricsRef.current;
    if (!m) return { pos: 0, idx: -1 };
    const { yLine0, yLine4, sp, startX, accSpacing, svgRect, svgH, svgW } = m;
    const svgY = ((clientY - svgRect.top) / svgRect.height) * svgH;
    const svgX = ((clientX - svgRect.left) / svgRect.width) * svgW;
    const pos = Math.max(
      -1,
      Math.min(10, Math.round(((yLine4 - svgY) / sp) * 2)),
    );
    // Check if near existing accidental
    let idx = -1;
    for (let i = 0; i < placed.length; i++) {
      const ax = startX + i * accSpacing + 8;
      if (Math.abs(svgX - ax) < 18) {
        idx = i;
        break;
      }
    }
    return { pos, idx };
  }

  function handleStaffPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (done || !accType) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const { pos, idx } = clientToStaff(e.clientX, e.clientY);
    if (idx >= 0) {
      setDraggingIdx(idx);
    } else if (placed.length < 7) {
      setPlaced((prev) => [...prev, pos]);
      setPlacedColors((prev) => [...prev, "#8b5cf6"]);
      setDraggingIdx(placed.length);
    }
  }

  function handleStaffPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (done || !accType) return;
    const { pos } = clientToStaff(e.clientX, e.clientY);
    setHoverPos(pos);
    if (draggingIdx !== null) {
      setPlaced((prev) => {
        const next = [...prev];
        if (draggingIdx < next.length) next[draggingIdx] = pos;
        return next;
      });
    }
  }

  function handleStaffPointerUp() {
    setDraggingIdx(null);
  }

  function handleDone() {
    const typeCorrect = (accType === "sharp") === expectedIsSharp;
    if (!typeCorrect || placed.length !== expectedCount) {
      const colors = placed.map(() => "#f87171");
      setPlacedColors(colors);
      setDone(true);
      setShowHints(true);
      onComplete(false);
      return;
    }
    const colors = placed.map((pos, i) =>
      pos === expectedPositions[i] ? "#4ade80" : "#f87171",
    );
    setPlacedColors(colors);
    const allCorrect = colors.every((c) => c === "#4ade80");
    setDone(true);
    if (!allCorrect) setShowHints(true);
    onComplete(allCorrect);
  }

  function handleDontKnow() {
    if (done) return;
    setAccType(expectedIsSharp ? "sharp" : "flat");
    setPlaced([...expectedPositions]);
    setPlacedColors(expectedPositions.map(() => "#4ade80"));
    setDone(true);
    setShowHints(false);
    onComplete(false);
  }

  function handleUndo() {
    if (placed.length === 0 || done) return;
    setPlaced((prev) => prev.slice(0, -1));
    setPlacedColors((prev) => prev.slice(0, -1));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* ♯ / ♭ selector */}
      <div
        onClick={(e) => {
          if (done) return;
          const rect = (
            e.currentTarget as HTMLDivElement
          ).getBoundingClientRect();
          const x = e.clientX - rect.left;
          setAccType(x < rect.width / 2 ? "sharp" : "flat");
        }}
        style={{
          display: "flex",
          width: 120,
          height: 42,
          borderRadius: 21,
          background: "#181821",
          border: `1.5px solid ${accType ? "#8b5cf6" : "#2e2e3e"}`,
          overflow: "hidden",
          cursor: done ? "default" : "pointer",
          position: "relative",
          touchAction: "none",
          transition: "border-color 0.15s",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            bottom: 2,
            width: "48%",
            borderRadius: 18,
            background: accType ? "rgba(139,92,246,0.08)" : "transparent",
            border: accType ? "1px solid #8b5cf6" : "none",
            left: accType === "sharp" ? 2 : accType === "flat" ? "50%" : -200,
            transition: "left 0.15s ease",
          }}
        />
        {(["sharp", "flat"] as const).map((t) => (
          <div
            key={t}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: accType === t ? 700 : 500,
                color: accType === t ? "#ede9fe" : "#65607a",
                fontFamily: "serif",
                transition: "all 0.12s",
              }}
            >
              {t === "sharp" ? "♯" : "♭"}
            </span>
          </div>
        ))}
      </div>

      {/* Staff */}
      <div
        ref={containerRef}
        onPointerDown={!done && !!accType ? handleStaffPointerDown : undefined}
        onPointerMove={!done && !!accType ? handleStaffPointerMove : undefined}
        onPointerUp={handleStaffPointerUp}
        onPointerLeave={() => {
          setHoverPos(null);
          setDraggingIdx(null);
        }}
        style={{
          width: "100%",
          cursor:
            !accType || done
              ? "default"
              : draggingIdx !== null
                ? "grabbing"
                : "crosshair",
          touchAction: "none",
          opacity: accType ? 1 : 0.4,
          transition: "opacity 0.2s",
        }}
      />

      {/* Controls */}
      {!done && (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {placed.length > 0 && (
            <button
              onClick={handleUndo}
              style={{
                background: "none",
                border: "1px solid #2e2e3e",
                borderRadius: 8,
                color: "#65607a",
                fontSize: 12,
                padding: "6px 14px",
                fontFamily: "'DM Sans',sans-serif",
                cursor: "pointer",
              }}
            >
              Undo
            </button>
          )}
          {placed.length > 0 && (
            <button
              onClick={handleDone}
              style={{
                padding: "8px 28px",
                borderRadius: 10,
                background: "#8b5cf6",
                border: "none",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Outfit',sans-serif",
                cursor: "pointer",
                boxShadow: "0 0 14px rgba(139,92,246,0.3)",
              }}
            >
              Done ({placed.length})
            </button>
          )}
          <button
            onClick={handleDontKnow}
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
        </div>
      )}

      {/* Result */}
      {done && placedColors.length > 0 && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif",
            color: placedColors.every((c) => c === "#4ade80")
              ? "#4ade80"
              : "#f87171",
          }}
        >
          {placedColors.every((c) => c === "#4ade80")
            ? "Correct!"
            : `${placedColors.filter((c) => c === "#4ade80").length}/${expectedCount} correct`}
        </div>
      )}
    </div>
  );
}
