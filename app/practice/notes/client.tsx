"use client";

import { useState } from "react";
import {
  IdentifyNote,
  type ClefType,
} from "@/components/practice/drills/identify-note";
import { PlayThisNote } from "@/components/practice/drills/play-this-note";

const DRILLS = [
  { id: "name", label: "Name This Note", sub: "Staff → Name" },
  { id: "play", label: "Play This Note", sub: "Staff → Keyboard" },
] as const;
type DrillId = (typeof DRILLS)[number]["id"];

const DIFFICULTIES = [
  { id: "treble", label: "Treble", clefs: ["treble"] as ClefType[] },
  {
    id: "treble-bass",
    label: "Treble + Bass",
    clefs: ["treble", "bass"] as ClefType[],
  },
  {
    id: "all",
    label: "All Clefs",
    clefs: ["treble", "bass", "alto"] as ClefType[],
  },
] as const;
type DifficultyId = (typeof DIFFICULTIES)[number]["id"];

function resolveClef(clefs: readonly ClefType[]): ClefType {
  return clefs[Math.floor(Math.random() * clefs.length)]!;
}

export function NotesDrillClient() {
  const [activeDrill, setActiveDrill] = useState<DrillId>("name");
  const [difficulty, setDifficulty] = useState<DifficultyId>("treble");
  const [resolvedClef, setResolvedClef] = useState<ClefType>("treble");
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentDifficulty = DIFFICULTIES.find((d) => d.id === difficulty)!;

  function resetStreak() {
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
  }

  function switchDrill(id: DrillId) {
    setActiveDrill(id);
    resetStreak();
    setResolvedClef(resolveClef(currentDifficulty.clefs));
  }

  function switchDifficulty(id: DifficultyId) {
    setDifficulty(id);
    const diff = DIFFICULTIES.find((d) => d.id === id)!;
    resetStreak();
    setResolvedClef(resolveClef(diff.clefs));
  }

  function advance() {
    setRoundKey((k) => k + 1);
    setAnswered(false);
    setResolvedClef(resolveClef(currentDifficulty.clefs));
  }

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(advance, isCorrect ? 1000 : 2000);
  }

  const currentDrill = DRILLS.find((d) => d.id === activeDrill)!;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-4">
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

      {/* Difficulty pills */}
      <div className="flex gap-1 self-stretch flex-wrap">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            onClick={() => switchDifficulty(d.id)}
            className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold font-body transition-all border cursor-pointer whitespace-nowrap ${
              difficulty === d.id
                ? "border-violet/40 text-violet bg-violet/5"
                : "border-steel text-ash"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Streak */}
      <div className="self-end font-mono text-[13px] text-silver">
        {total > 0 ? `${correct}/${total}` : "\u00a0"}
      </div>

      {/* Drill card */}
      <div
        className="w-full bg-obsidian border border-steel rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
        style={{ padding: "24px 20px 18px" }}
      >
        <div className="text-center mb-4">
          <div className="font-display text-lg font-semibold text-ivory">
            {currentDrill.label}
          </div>
          <div className="font-body text-xs text-ash mt-0.5">
            {activeDrill === "name"
              ? "Slide to select · up ♯ · down ♭"
              : "Tap the correct key"}
          </div>
        </div>

        {activeDrill === "name" && (
          <IdentifyNote
            key={roundKey}
            clef={resolvedClef}
            onAnswer={handleAnswer}
          />
        )}
        {activeDrill === "play" && (
          <PlayThisNote
            key={roundKey}
            clef={resolvedClef}
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
