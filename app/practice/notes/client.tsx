"use client";

import { useState } from "react";
import { IdentifyNote } from "@/components/practice/drills/identify-note";

const CLEF_OPTIONS = [
  { id: "both", label: "Both" },
  { id: "treble", label: "Treble" },
  { id: "bass", label: "Bass" },
] as const;

type ClefOption = (typeof CLEF_OPTIONS)[number]["id"];

function resolveClef(opt: ClefOption): "treble" | "bass" {
  if (opt === "both") return Math.random() < 0.5 ? "treble" : "bass";
  return opt;
}

export function NotesDrillClient() {
  const [clefOption, setClefOption] = useState<ClefOption>("both");
  const [resolvedClef, setResolvedClef] = useState<"treble" | "bass">(() =>
    resolveClef("both"),
  );
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  function switchClef(opt: ClefOption) {
    setClefOption(opt);
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
    setResolvedClef(resolveClef(opt));
  }

  function advance() {
    setRoundKey((k) => k + 1);
    setAnswered(false);
    setResolvedClef(resolveClef(clefOption));
  }

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(advance, isCorrect ? 1000 : 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-5">
      {/* Clef selector */}
      <div className="flex gap-2 self-stretch">
        {CLEF_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => switchClef(opt.id)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-body transition-all border ${
              clefOption === opt.id
                ? "border-violet/40 text-violet bg-violet/5"
                : "border-steel text-ash"
            }`}
          >
            {opt.label}
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
            Name This Note
          </div>
          <div className="font-body text-xs text-ash mt-0.5">
            Slide to select · up ♯ · down ♭
          </div>
        </div>

        <IdentifyNote
          key={roundKey}
          clef={resolvedClef}
          onAnswer={handleAnswer}
        />
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
