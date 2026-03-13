"use client";

import { useState } from "react";
import { IdentifyKey } from "@/components/practice/drills/identify-key";
import { WriteKeySig } from "@/components/practice/drills/write-key-sig";

const DRILLS = [
  { id: "identify", label: "Identify Key", sub: "Key sig → name" },
  { id: "write", label: "Write Key Sig", sub: "Name → staff" },
] as const;

type DrillId = (typeof DRILLS)[number]["id"];

const MODES = [
  { id: "major", label: "Major" },
  { id: "minor", label: "Minor" },
  { id: "both", label: "Both" },
] as const;
type ModeId = (typeof MODES)[number]["id"];

function resolveMode(m: ModeId): "major" | "minor" {
  if (m === "both") return Math.random() < 0.5 ? "major" : "minor";
  return m;
}

export function KeysDrillClient() {
  const [activeDrill, setActiveDrill] = useState<DrillId>("identify");
  const [activeMode, setActiveMode] = useState<ModeId>("major");
  const [resolvedMode, setResolvedMode] = useState<"major" | "minor">("major");
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  function switchDrill(id: DrillId) {
    setActiveDrill(id);
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
    setResolvedMode(resolveMode(activeMode));
  }

  function switchMode(id: ModeId) {
    setActiveMode(id);
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
    setResolvedMode(resolveMode(id));
  }

  function advance() {
    setRoundKey((k) => k + 1);
    setAnswered(false);
    setResolvedMode(resolveMode(activeMode));
  }

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(advance, isCorrect ? 1000 : 2000);
  }

  const currentDrill = DRILLS.find((d) => d.id === activeDrill)!;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-5">
      {/* Drill type tabs */}
      <div className="flex gap-2 self-stretch">
        {DRILLS.map((drill) => (
          <button
            key={drill.id}
            onClick={() => switchDrill(drill.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold font-body transition-all border ${
              activeDrill === drill.id
                ? "bg-violet/10 border-violet text-violet"
                : "border-steel text-silver hover:border-silver/40"
            }`}
          >
            <div>{drill.label}</div>
            <div className="text-[10px] font-normal mt-0.5 opacity-70">
              {drill.sub}
            </div>
          </button>
        ))}
      </div>

      {/* Major/Minor/Both toggle */}
      <div className="flex gap-2 self-stretch">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchMode(m.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-body transition-all border ${
              activeMode === m.id
                ? "border-violet/40 text-violet bg-violet/5"
                : "border-steel text-ash"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Streak */}
      <div className="self-end font-mono text-[13px] text-silver">
        {total > 0 ? `${correct}/${total}` : "\u00a0"}
      </div>

      {/* Card */}
      <div
        className="w-full bg-obsidian border border-steel rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
        style={{ padding: "24px 20px 18px" }}
      >
        <div className="text-center mb-4">
          <div className="font-display text-lg font-semibold text-ivory">
            {currentDrill.label}
          </div>
          <div className="font-body text-xs text-ash mt-0.5">
            {activeDrill === "identify"
              ? "Slide to select the key name"
              : "Select ♯ or ♭, then tap staff positions"}
          </div>
        </div>

        {activeDrill === "identify" && (
          <IdentifyKey
            key={roundKey}
            mode={resolvedMode}
            onAnswer={handleAnswer}
          />
        )}
        {activeDrill === "write" && (
          <WriteKeySig
            key={roundKey}
            mode={resolvedMode}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {answered && (
        <button
          onClick={advance}
          className="px-6 py-2 rounded-lg text-sm font-body font-medium transition-colors border"
          style={{
            background: "rgba(139,92,246,0.08)",
            borderColor: "rgba(139,92,246,0.15)",
            color: "#8b5cf6",
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
