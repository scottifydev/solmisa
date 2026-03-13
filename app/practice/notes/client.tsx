"use client";

import { useState } from "react";
import { DrillWrapper } from "@/components/practice/drill-wrapper";
import { PlayThisNote } from "@/components/practice/drills/play-this-note";
import { PlaceNoteOnStaff } from "@/components/practice/drills/place-note-on-staff";

const DRILLS = [
  { id: "play", label: "Play This Note", sub: "Staff → Keyboard" },
  { id: "place", label: "Place on Staff", sub: "Name → Staff" },
] as const;

type DrillId = (typeof DRILLS)[number]["id"];

export function NotesDrillClient() {
  const [activeDrill, setActiveDrill] = useState<DrillId>("play");
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentDrill = DRILLS.find((d) => d.id === activeDrill)!;

  function switchDrill(id: DrillId) {
    setActiveDrill(id);
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
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
          <PlayThisNote key={roundKey} onAnswer={handleAnswer} />
        )}
        {activeDrill === "place" && (
          <PlaceNoteOnStaff key={roundKey} onAnswer={handleAnswer} />
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
