"use client";

import { useState, useEffect, useRef } from "react";
import { MusicalAlphabetBand } from "../inputs/musical-alphabet-band";

// All 15 key signatures
const KEY_SIGS = [
  { id: "C", sharps: 0, flats: 0, major: "C", minor: "A" },
  { id: "G", sharps: 1, flats: 0, major: "G", minor: "E" },
  { id: "D", sharps: 2, flats: 0, major: "D", minor: "B" },
  { id: "A", sharps: 3, flats: 0, major: "A", minor: "F♯" },
  { id: "E", sharps: 4, flats: 0, major: "E", minor: "C♯" },
  { id: "B", sharps: 5, flats: 0, major: "B", minor: "G♯" },
  { id: "F♯", sharps: 6, flats: 0, major: "F♯", minor: "D♯" },
  { id: "F", sharps: 0, flats: 1, major: "F", minor: "D" },
  { id: "B♭", sharps: 0, flats: 2, major: "B♭", minor: "G" },
  { id: "E♭", sharps: 0, flats: 3, major: "E♭", minor: "C" },
  { id: "A♭", sharps: 0, flats: 4, major: "A♭", minor: "F" },
  { id: "D♭", sharps: 0, flats: 5, major: "D♭", minor: "B♭" },
  { id: "G♭", sharps: 0, flats: 6, major: "G♭", minor: "E♭" },
];

const SHARP_POSITIONS = [8, 5, 9, 6, 3, 7, 4];
const FLAT_POSITIONS = [4, 7, 3, 6, 2, 5, 1];

async function renderKeySig(
  container: HTMLDivElement,
  keySig: (typeof KEY_SIGS)[0],
) {
  const { Renderer, Stave } = await import("vexflow");

  container.innerHTML = "";
  const W = 240,
    H = 130;
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(W, H);
  const context = renderer.getContext();
  context.setFillStyle("#3a3a4e");
  context.setStrokeStyle("#3a3a4e");

  const stave = new Stave(10, 20, W - 20);
  stave.addClef("treble");
  stave.setStyle({ fillStyle: "#3a3a4e", strokeStyle: "#3a3a4e" });
  stave.setContext(context);
  stave.draw();

  const svg = container.querySelector("svg");
  if (!svg) return;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.height = "auto";
  svg.style.filter = "drop-shadow(0 0 4px rgba(237,233,254,0.25))";

  const yLine0 = stave.getYForLine(0);
  const yLine4 = stave.getYForLine(4);
  const sp = (yLine4 - yLine0) / 4;
  function posToY(pos: number) {
    return yLine4 - (pos * sp) / 2;
  }

  const isSharp = keySig.sharps > 0;
  const positions = isSharp ? SHARP_POSITIONS : FLAT_POSITIONS;
  const count = isSharp ? keySig.sharps : keySig.flats;
  const sym = isSharp ? "♯" : "♭";
  const startX = 68;
  const spacing = 18;

  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing;
    const y = posToY(positions[i]!) + (isSharp ? 6 : 8);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(x));
    text.setAttribute("y", String(y));
    text.setAttribute("font-size", isSharp ? "22" : "26");
    text.setAttribute("fill", "#ede9fe");
    text.setAttribute(
      "font-family",
      "'Bravura','Academico','Noto Music',serif",
    );
    text.setAttribute(
      "style",
      "user-select:none; filter:drop-shadow(0 0 3px rgba(237,233,254,0.4))",
    );
    text.textContent = sym;
    svg.appendChild(text);
  }

  if (count === 0) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(W / 2));
    text.setAttribute("y", String(yLine4 - sp));
    text.setAttribute("font-size", "13");
    text.setAttribute("fill", "#65607a");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-family", "'DM Sans',sans-serif");
    text.setAttribute("style", "user-select:none");
    text.textContent = "(no accidentals)";
    svg.appendChild(text);
  }
}

let lastKeySigId: string | undefined;
function randomKeySig() {
  for (let i = 0; i < 3; i++) {
    const ks = KEY_SIGS[Math.floor(Math.random() * KEY_SIGS.length)]!;
    if (ks.id !== lastKeySigId || KEY_SIGS.length <= 1) {
      lastKeySigId = ks.id;
      return ks;
    }
  }
  const ks = KEY_SIGS[Math.floor(Math.random() * KEY_SIGS.length)]!;
  lastKeySigId = ks.id;
  return ks;
}

interface IdentifyKeyProps {
  mode?: "major" | "minor";
  onAnswer: (correct: boolean) => void;
}

export function IdentifyKey({ mode = "major", onAnswer }: IdentifyKeyProps) {
  const [keySig] = useState(randomKeySig);
  const [answered, setAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const correctAnswer = mode === "major" ? keySig.major : keySig.minor;

  useEffect(() => {
    if (containerRef.current) {
      renderKeySig(containerRef.current, keySig);
    }
  }, [keySig]);

  function handleAnswer(correct: boolean) {
    if (answered) return;
    setAnswered(true);
    onAnswer(correct);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        width: "100%",
      }}
    >
      <div ref={containerRef} style={{ width: "100%", maxWidth: 260 }} />
      <MusicalAlphabetBand
        correctAnswer={correctAnswer}
        onAnswer={(correct) => handleAnswer(correct)}
        disabled={answered}
      />
    </div>
  );
}
