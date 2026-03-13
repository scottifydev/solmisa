"use client";

import { useState } from "react";
import { PlayThisNote } from "@/components/practice/drills/play-this-note";
import { PlaceNoteOnStaff } from "@/components/practice/drills/place-note-on-staff";

const DRILLS = [
  { id: "play", label: "Play This Note", sub: "Staff → Keyboard" },
  { id: "place", label: "Place on Staff", sub: "Name → Staff" },
] as const;

type DrillId = (typeof DRILLS)[number]["id"];

const KEY_OPTIONS = ["C", "G", "D", "F", "B♭", "E♭"] as const;
type KeyOption = (typeof KEY_OPTIONS)[number];

const RANGES = [
  { id: "beginner", label: "C4–C5" },
  { id: "advanced", label: "C4–E5" },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

export function NotesDrillClient() {
  const [activeDrill, setActiveDrill] = useState<DrillId>("play");
  const [activeKey, setActiveKey] = useState<KeyOption>("C");
  const [activeRange, setActiveRange] = useState<RangeId>("beginner");
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentDrill = DRILLS.find((d) => d.id === activeDrill)!;

  function resetRound() {
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
  }

  function switchDrill(id: DrillId) {
    setActiveDrill(id);
    resetRound();
  }

  function switchKey(k: KeyOption) {
    setActiveKey(k);
    resetRound();
  }

  function switchRange(r: RangeId) {
    setActiveRange(r);
    resetRound();
  }

  function advance() {
    setRoundKey((k) => k + 1);
    setAnswered(false);
  }

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    const delay = isCorrect ? 1000 : 2000;
    setTimeout(advance, delay);
  }

  const pillBase =
    "py-1 px-2.5 rounded-lg text-[10px] font-semibold font-body transition-all border cursor-pointer";
  const pillActive = "border-violet/40 text-violet bg-violet/5";
  const pillInactive = "border-steel text-ash";

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

      {/* Settings row */}
      <div className="self-stretch flex flex-wrap gap-3 items-center">
        {/* Key pills */}
        <div className="flex gap-1 flex-wrap">
          {KEY_OPTIONS.map((k) => (
            <button
              key={k}
              onClick={() => switchKey(k)}
              className={`${pillBase} ${activeKey === k ? pillActive : pillInactive}`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Range toggle */}
        <div className="flex gap-1 ml-auto">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRange(r.id)}
              className={`${pillBase} ${activeRange === r.id ? pillActive : pillInactive}`}
            >
              {r.label}
            </button>
          ))}
        </div>
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
        </div>

        {activeDrill === "play" && (
          <PlayThisNote
            key={roundKey}
            range={activeRange}
            onAnswer={handleAnswer}
          />
        )}
        {activeDrill === "place" && (
          <PlaceNoteOnStaff
            key={roundKey}
            range={activeRange}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Manual next */}
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
