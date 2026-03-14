"use client";

import { useState } from "react";
import { BuildScale } from "@/components/practice/drills/build-scale";
import { BuildMode } from "@/components/practice/drills/build-mode";

const DRILLS = [
  { id: "scale", label: "Build Scale", sub: "Name → construct" },
  { id: "mode", label: "Build Mode", sub: "Name → alter major" },
] as const;

type DrillId = (typeof DRILLS)[number]["id"];

const SCALE_OPTIONS = [
  "All",
  "Natural Minor",
  "Harmonic Minor",
  "Melodic Minor",
  "Major Pentatonic",
  "Minor Pentatonic",
  "Blues",
  "Whole Tone",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Locrian",
] as const;

const MODE_OPTIONS = [
  "All",
  "Lydian",
  "Ionian",
  "Mixolydian",
  "Dorian",
  "Aeolian",
  "Phrygian",
  "Locrian",
] as const;

const KEY_OPTIONS = ["All", "C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"] as const;

export function ScalesDrillClient() {
  const [activeDrill, setActiveDrill] = useState<DrillId>("scale");
  const [scaleFilter, setScaleFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [keyFilter, setKeyFilter] = useState("All");
  const [roundKey, setRoundKey] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [answered, setAnswered] = useState(false);

  function resetStreak() {
    setRoundKey((k) => k + 1);
    setCorrect(0);
    setTotal(0);
    setAnswered(false);
  }

  function switchDrill(id: DrillId) {
    setActiveDrill(id);
    resetStreak();
  }

  function advance() {
    setRoundKey((k) => k + 1);
    setAnswered(false);
  }

  function handleAnswer(isCorrect: boolean) {
    setAnswered(true);
    setTotal((t) => t + 1);
    if (isCorrect) setCorrect((c) => c + 1);
    setTimeout(advance, isCorrect ? 1000 : 2000);
  }

  const currentDrill = DRILLS.find((d) => d.id === activeDrill)!;

  const pillBase =
    "py-1 px-2.5 rounded-lg text-[10px] font-semibold font-body transition-all border cursor-pointer whitespace-nowrap";
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

      {/* Settings for Build Scale */}
      {activeDrill === "scale" && (
        <div className="self-stretch">
          <div className="text-[9px] uppercase tracking-widest text-ash mb-1.5 font-body">
            Scale type
          </div>
          <div className="flex flex-wrap gap-1">
            {SCALE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScaleFilter(s);
                  resetStreak();
                }}
                className={`${pillBase} ${scaleFilter === s ? pillActive : pillInactive}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings for Build Mode */}
      {activeDrill === "mode" && (
        <div className="self-stretch flex flex-col gap-2">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-ash mb-1.5 font-body">
              Mode
            </div>
            <div className="flex flex-wrap gap-1">
              {MODE_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setModeFilter(m);
                    resetStreak();
                  }}
                  className={`${pillBase} ${modeFilter === m ? pillActive : pillInactive}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-ash mb-1.5 font-body">
              Key
            </div>
            <div className="flex flex-wrap gap-1">
              {KEY_OPTIONS.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setKeyFilter(k);
                    resetStreak();
                  }}
                  className={`${pillBase} ${keyFilter === k ? pillActive : pillInactive}`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
            {activeDrill === "scale"
              ? "Drag up for ♯ · drag down for ♭ · tap to omit"
              : "Start from major — drag notes to alter degrees"}
          </div>
        </div>

        {activeDrill === "scale" && (
          <BuildScale
            key={roundKey}
            scaleType={scaleFilter === "All" ? undefined : scaleFilter}
            onAnswer={handleAnswer}
          />
        )}
        {activeDrill === "mode" && (
          <BuildMode
            key={roundKey}
            modeType={modeFilter === "All" ? undefined : modeFilter}
            modeKey={keyFilter === "All" ? undefined : keyFilter}
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
