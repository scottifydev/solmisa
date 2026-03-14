"use client";

import { useState, useRef } from "react";

const C_MAJOR_POS = [-2, -1, 0, 1, 2, 3, 4, 5];
const SHARP_POS = [8, 5, 9, 6, 3, 7, 4];
const FLAT_POS = [4, 7, 3, 6, 2, 5, 1];

export interface KeyData {
  name: string;
  positions: number[];
  sharps: number;
  flats: number;
}

export interface StaffNoteDraggerProps {
  correctAsc: (number | null)[];
  correctDesc?: (number | null)[] | null;
  keyData?: KeyData;
  startPositions?: number[];
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

export function StaffNoteDragger({
  correctAsc,
  correctDesc,
  keyData,
  startPositions,
  onComplete,
  disabled = false,
}: StaffNoteDraggerProps) {
  const isMode = !!keyData;
  const hasTwoRows = !isMode && (correctDesc ?? null) !== null;
  const noteCount = isMode ? keyData.positions.length : correctAsc.length;
  const basePositions = isMode ? keyData.positions : (startPositions ?? C_MAJOR_POS);

  // Layout
  const sp = isMode ? 16 : 14;
  const W = isMode ? 400 : 400;
  const rowH = 160;
  const staffTopBase = isMode ? 30 : 20;
  const H = hasTwoRows ? rowH * 2 + 30 : rowH + 20;
  const keySigCount = isMode ? keyData.sharps || keyData.flats : 0;
  const clefWidth = 60;
  const noteStartX = clefWidth + 10 + keySigCount * 14;
  const noteSpacing = isMode
    ? Math.min(36, (W - noteStartX - 20) / noteCount)
    : Math.min(34, (W - noteStartX - 16) / noteCount);
  const rx = isMode ? 7.5 : 7;
  const ry = isMode ? 5.5 : 5;

  // State
  const [ascAlts, setAscAlts] = useState<number[]>(
    () => Array(noteCount).fill(0) as number[],
  );
  const [ascMuted, setAscMuted] = useState<boolean[]>(
    () => Array(noteCount).fill(false) as boolean[],
  );
  const [descAlts, setDescAlts] = useState<number[]>(
    () => Array(noteCount).fill(0) as number[],
  );
  const [descMuted, setDescMuted] = useState<boolean[]>(
    () => Array(noteCount).fill(false) as boolean[],
  );
  const [dragging, setDragging] = useState<{
    row: "asc" | "desc";
    deg: number;
  } | null>(null);
  const startYRef = useRef<number | null>(null);
  const [done, setDone] = useState(false);
  const [ascResults, setAscResults] = useState<boolean[] | null>(null);
  const [descResults, setDescResults] = useState<boolean[] | null>(null);

  function noteX(deg: number, reversed = false): number {
    return reversed
      ? noteStartX + (noteCount - 1 - deg) * noteSpacing
      : noteStartX + deg * noteSpacing;
  }

  function accSym(alt: number | null): string | null {
    if (alt === 1) return "♯";
    if (alt === -1) return "♭";
    return null;
  }

  function lY(i: number, yOff = 0): number {
    return staffTopBase + yOff + i * sp;
  }

  function posToY(pos: number, yOff = 0): number {
    return lY(4, yOff) - (pos * sp) / 2;
  }

  // SVG-level pointer handlers
  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging || done) return;
    const { row, deg } = dragging;
    const dy = e.clientY - (startYRef.current ?? e.clientY);
    const thresh = sp * 0.5;
    const newAlt = dy < -thresh ? 1 : dy > thresh ? -1 : 0;
    const setAlts = row === "asc" ? setAscAlts : setDescAlts;
    const setMuted = row === "asc" ? setAscMuted : setDescMuted;
    const muted = row === "asc" ? ascMuted : descMuted;

    setAlts((prev) => {
      if (prev[deg] === newAlt) return prev;
      const next = [...prev];
      next[deg] = newAlt;
      if (!isMode && deg === 0) next[noteCount - 1] = newAlt;
      if (!isMode && deg === noteCount - 1) next[0] = newAlt;
      return next;
    });

    if (!isMode && muted[deg]) {
      setMuted((prev) => {
        const next = [...prev];
        next[deg] = false;
        if (deg === 0) next[noteCount - 1] = false;
        if (deg === noteCount - 1) next[0] = false;
        return next;
      });
    }
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const { row, deg } = dragging;
    const dy = Math.abs(e.clientY - (startYRef.current ?? e.clientY));

    // tap = toggle mute (scale builder only)
    if (!isMode && dy < 5) {
      const muted = row === "asc" ? ascMuted : descMuted;
      const setMuted = row === "asc" ? setAscMuted : setDescMuted;
      const setAlts = row === "asc" ? setAscAlts : setDescAlts;
      const newMuted = !muted[deg];
      setMuted((prev) => {
        const next = [...prev];
        next[deg] = newMuted;
        if (deg === 0) next[noteCount - 1] = newMuted;
        if (deg === noteCount - 1) next[0] = newMuted;
        return next;
      });
      if (newMuted) {
        setAlts((prev) => {
          const next = [...prev];
          next[deg] = 0;
          if (deg === 0) next[noteCount - 1] = 0;
          if (deg === noteCount - 1) next[0] = 0;
          return next;
        });
      }
    }
    setDragging(null);
    startYRef.current = null;
  }

  function handlePointerLeave() {
    setDragging(null);
    startYRef.current = null;
  }

  // Check / done / reset
  function checkRow(
    alts: number[],
    muted: boolean[],
    correct: (number | null)[],
  ): boolean[] {
    return correct.map((c, i) => {
      if (c === null) return muted[i] ?? false;
      if (muted[i]) return false;
      return alts[i] === c;
    });
  }

  function handleDone() {
    const ar = checkRow(ascAlts, ascMuted, correctAsc);
    const dr =
      hasTwoRows && correctDesc
        ? checkRow(descAlts, descMuted, correctDesc)
        : null;
    setAscResults(ar);
    setDescResults(dr);
    setDone(true);
    onComplete(ar.every(Boolean) && (!dr || dr.every(Boolean)));
  }

  function handleReset() {
    setAscAlts(Array(noteCount).fill(0) as number[]);
    setAscMuted(Array(noteCount).fill(false) as boolean[]);
    setDescAlts(Array(noteCount).fill(0) as number[]);
    setDescMuted(Array(noteCount).fill(false) as boolean[]);
    setDone(false);
    setAscResults(null);
    setDescResults(null);
  }

  function handleDontKnow() {
    function apply(
      correct: (number | null)[],
      setA: React.Dispatch<React.SetStateAction<number[]>>,
      setM: React.Dispatch<React.SetStateAction<boolean[]>>,
    ) {
      setA(correct.map((c) => (c === null ? 0 : c)));
      setM(correct.map((c) => c === null));
    }
    apply(correctAsc, setAscAlts, setAscMuted);
    if (hasTwoRows && correctDesc)
      apply(correctDesc, setDescAlts, setDescMuted);
    setAscResults(correctAsc.map(() => true));
    if (hasTwoRows && correctDesc) setDescResults(correctDesc.map(() => true));
    setDone(true);
    onComplete(false);
  }

  const hasChanges =
    ascAlts.some((a) => a !== 0) ||
    ascMuted.some((m) => m) ||
    descAlts.some((a) => a !== 0) ||
    descMuted.some((m) => m);

  // Row renderer
  function renderRow(rowId: "asc" | "desc", yOff: number) {
    const alts = rowId === "asc" ? ascAlts : descAlts;
    const muted = rowId === "asc" ? ascMuted : descMuted;
    const results = rowId === "asc" ? ascResults : descResults;
    const correct = rowId === "asc" ? correctAsc : (correctDesc ?? null);
    const reversed = rowId === "desc";

    const rowLY = (i: number) => lY(i, yOff);
    const rowPosToY = (pos: number) => posToY(pos, yOff);

    function noteColor(deg: number): string {
      if (!isMode && muted[deg]) return "#2a2640";
      if (!done) return (alts[deg] ?? 0) !== 0 ? "#8b5cf6" : "#ede9fe";
      if (results) return results[deg] ? "#4ade80" : "#f87171";
      return "#ede9fe";
    }

    function noteGlow(deg: number): string {
      if (!isMode && muted[deg]) return "none";
      if (!done)
        return (alts[deg] ?? 0) !== 0
          ? "rgba(139,92,246,0.3)"
          : "rgba(237,233,254,0.1)";
      if (results)
        return results[deg] ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)";
      return "rgba(237,233,254,0.1)";
    }

    return (
      <g>
        {/* Row direction label */}
        {hasTwoRows && (
          <text
            x={8}
            y={rowLY(2) + 4}
            fontSize={9}
            fill="#65607a"
            fontFamily="'DM Sans',sans-serif"
            style={{ userSelect: "none" }}
          >
            {rowId === "asc" ? "↑" : "↓"}
          </text>
        )}

        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`${rowId}l${i}`}
            x1={16}
            y1={rowLY(i)}
            x2={W - 14}
            y2={rowLY(i)}
            stroke="#3a3a4e"
            strokeWidth="1"
          />
        ))}

        {/* Treble clef */}
        <text
          x={18}
          y={rowLY(3) + sp * 0.3}
          fontSize={sp * 3.6}
          fill="#ede9fe"
          opacity="0.6"
          fontFamily="'Bravura','Academico','Noto Music',serif"
          style={{ userSelect: "none" }}
        >
          𝄞
        </text>

        {/* Key signature (mode builder only) */}
        {isMode &&
          keySigCount > 0 &&
          Array.from({ length: keySigCount }, (_, i) => {
            const isSharp = keyData!.sharps > 0;
            const kPos = (isSharp ? SHARP_POS : FLAT_POS)[i]!;
            const ksX = 48 + i * 14;
            const ksY = rowPosToY(kPos) + (isSharp ? 5 : 7);
            return (
              <text
                key={`ks${i}`}
                x={ksX}
                y={ksY}
                fontSize={isSharp ? 16 : 19}
                fill="#ede9fe"
                opacity="0.7"
                fontFamily="'Bravura','Academico','Noto Music',serif"
                style={{ userSelect: "none" }}
              >
                {isSharp ? "♯" : "♭"}
              </text>
            );
          })}

        {/* Notes */}
        {basePositions.slice(0, noteCount).map((basePos, deg) => {
          const y = rowPosToY(basePos);
          const x = noteX(deg, reversed);
          const color = noteColor(deg);
          const glow = noteGlow(deg);
          const alt = !isMode && (muted[deg] ?? false) ? 0 : (alts[deg] ?? 0);
          const acc = accSym(alt);
          const isMuted = !isMode && (muted[deg] ?? false);
          const isDragging = dragging?.row === rowId && dragging?.deg === deg;

          const showCorrectHint = done && results && !results[deg];
          const correctAlt = correct ? (correct[deg] ?? 0) : 0;
          const isOmitted = correct ? correct[deg] === null : false;
          const correctAcc = accSym(
            typeof correctAlt === "number" ? correctAlt : 0,
          );

          return (
            <g key={`${rowId}n${deg}`}>
              {/* Ledger lines below staff */}
              {basePos <= -2 &&
                !isMuted &&
                Array.from(
                  { length: Math.floor((-2 - basePos) / 2) + 1 },
                  (_, li) => -2 - li * 2,
                ).map((lp) => (
                  <line
                    key={`ll${lp}`}
                    x1={x - rx * 1.8}
                    y1={rowPosToY(lp)}
                    x2={x + rx * 1.8}
                    y2={rowPosToY(lp)}
                    stroke="#3a3a4e"
                    strokeWidth="1"
                  />
                ))}
              {/* Ledger lines above staff */}
              {basePos >= 10 &&
                !isMuted &&
                Array.from(
                  { length: Math.floor((basePos - 8) / 2) + 1 },
                  (_, li) => 10 + li * 2,
                ).map((lp) => (
                  <line
                    key={`ul${lp}`}
                    x1={x - rx * 1.8}
                    y1={rowPosToY(lp)}
                    x2={x + rx * 1.8}
                    y2={rowPosToY(lp)}
                    stroke="#3a3a4e"
                    strokeWidth="1"
                  />
                ))}

              {/* Drag/tap zone */}
              <rect
                x={x - 16}
                y={rowLY(0) - 16}
                width={32}
                height={rowLY(4) - rowLY(0) + 32}
                fill="transparent"
                style={{ cursor: done || disabled ? "default" : "pointer" }}
                onPointerDown={(e) => {
                  if (done || disabled) return;
                  e.preventDefault();
                  setDragging({ row: rowId, deg });
                  startYRef.current = e.clientY;
                }}
              />

              {/* Accidental */}
              {acc && !isMuted && (
                <text
                  x={x - rx - 9}
                  y={y + 4}
                  fontSize={isMode ? 14 : 13}
                  fill={color}
                  fontFamily="'Bravura','Academico','Noto Music',serif"
                  style={{
                    filter: `drop-shadow(0 0 3px ${glow})`,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {acc}
                </text>
              )}

              {/* Notehead glow (mode only) */}
              {isMode && (
                <ellipse
                  cx={x}
                  cy={y}
                  rx={rx + 3}
                  ry={ry + 2}
                  fill={glow}
                  opacity="0.4"
                  transform={`rotate(-10, ${x}, ${y})`}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Notehead */}
              <ellipse
                cx={x}
                cy={y}
                rx={rx}
                ry={ry}
                fill={color}
                opacity={isMuted ? 0.2 : 1}
                transform={`rotate(-10, ${x}, ${y})`}
                style={{
                  filter: isMuted ? "none" : `drop-shadow(0 0 4px ${glow})`,
                  pointerEvents: "none",
                  transition: done ? "all 0.2s" : "none",
                }}
              />

              {/* X through muted note */}
              {isMuted && (
                <g style={{ pointerEvents: "none" }}>
                  <line
                    x1={x - 5}
                    y1={y - 5}
                    x2={x + 5}
                    y2={y + 5}
                    stroke="#65607a"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <line
                    x1={x + 5}
                    y1={y - 5}
                    x2={x - 5}
                    y2={y + 5}
                    stroke="#65607a"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                </g>
              )}

              {/* Stem */}
              {!isMuted && (
                <line
                  x1={x + rx - 0.5}
                  y1={y - 1}
                  x2={x + rx - 0.5}
                  y2={y - sp * 2.5}
                  stroke={color}
                  strokeWidth="1.2"
                  opacity={isMode ? "0.6" : "0.5"}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Drag direction indicators */}
              {isDragging && !isMuted && (
                <g style={{ pointerEvents: "none" }}>
                  <text
                    x={x}
                    y={rowLY(0) - (isMode ? 10 : 8)}
                    textAnchor="middle"
                    fontSize={isMode ? 10 : 9}
                    fill="#8b5cf6"
                    opacity="0.5"
                    fontFamily="'DM Sans',sans-serif"
                  >
                    ♯
                  </text>
                  <text
                    x={x}
                    y={rowLY(4) + (isMode ? 38 : 20)}
                    textAnchor="middle"
                    fontSize={isMode ? 10 : 9}
                    fill="#8b5cf6"
                    opacity="0.5"
                    fontFamily="'DM Sans',sans-serif"
                  >
                    ♭
                  </text>
                </g>
              )}

              {/* Degree label */}
              <text
                x={x}
                y={rowLY(4) + sp * 2 + (hasTwoRows ? 2 : 6)}
                textAnchor="middle"
                fontSize={10}
                fill={isMuted ? "#2e2e3e" : alt !== 0 ? "#8b5cf6" : "#65607a"}
                fontFamily="'DM Sans',sans-serif"
                fontWeight={alt !== 0 || isMuted ? 700 : 400}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {isMuted
                  ? "×"
                  : alt !== 0
                    ? `${acc ?? ""}${deg + 1}`
                    : `${deg + 1}`}
              </text>

              {/* Correct hint after wrong answer */}
              {showCorrectHint && (
                <g style={{ pointerEvents: "none" }}>
                  {isOmitted ? (
                    <g>
                      <line
                        x1={x - 6}
                        y1={y - 6}
                        x2={x + 6}
                        y2={y + 6}
                        stroke="#4ade80"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                      <line
                        x1={x + 6}
                        y1={y - 6}
                        x2={x - 6}
                        y2={y + 6}
                        stroke="#4ade80"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    </g>
                  ) : (
                    <g>
                      {correctAcc && (
                        <text
                          x={x - rx - 9}
                          y={y + 4}
                          fontSize={isMode ? 14 : 13}
                          fill="#4ade80"
                          opacity="0.5"
                          fontFamily="'Bravura','Academico','Noto Music',serif"
                          style={{
                            filter: "drop-shadow(0 0 4px rgba(74,222,128,0.3))",
                          }}
                        >
                          {correctAcc}
                        </text>
                      )}
                      <ellipse
                        cx={x}
                        cy={y}
                        rx={rx}
                        ry={ry}
                        fill="#4ade80"
                        opacity={isMode ? 0.35 : 0.3}
                        transform={`rotate(-10, ${x}, ${y})`}
                        style={{
                          filter: "drop-shadow(0 0 4px rgba(74,222,128,0.3))",
                        }}
                      />
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  const allCorrect =
    (ascResults?.every(Boolean) ?? false) &&
    (!hasTwoRows || (descResults?.every(Boolean) ?? false));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Hint */}
      {!done && (
        <div
          style={{
            fontSize: 11,
            color: "#65607a",
            fontFamily: "'DM Sans',sans-serif",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          {isMode
            ? "Drag notes up for ♯ · down for ♭"
            : "Drag up for ♯ · drag down for ♭ · tap to omit"}
        </div>
      )}

      {/* SVG canvas */}
      <div
        style={{
          background: "#0f0f16",
          borderRadius: 14,
          border: "1px solid #2e2e3e",
          padding: "10px 8px",
          width: "100%",
          maxWidth: W,
          boxSizing: "border-box",
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{
            overflow: "visible",
            touchAction: "none",
            width: "100%",
            height: "auto",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {renderRow("asc", 0)}

          {hasTwoRows && (
            <>
              <line
                x1={30}
                y1={rowH + 5}
                x2={W - 30}
                y2={rowH + 5}
                stroke="#2e2e3e"
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              {renderRow("desc", rowH + 15)}
            </>
          )}
        </svg>
      </div>

      {/* Controls */}
      {!done && (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {hasChanges && (
            <button
              onClick={handleReset}
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
              Reset
            </button>
          )}
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
            Done
          </button>
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
      {done && ascResults && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif",
            color: allCorrect ? "#4ade80" : "#f87171",
          }}
        >
          {allCorrect
            ? "Correct!"
            : hasTwoRows
              ? `Ascending: ${ascResults.filter(Boolean).length}/7 · Descending: ${(descResults ?? []).filter(Boolean).length}/7`
              : `${ascResults.filter(Boolean).length}/7 correct`}
        </div>
      )}
    </div>
  );
}
