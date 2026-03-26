"use client";

const AMBER = "#f0c97a";
const DIM = "#555";

export interface OverlayState {
  guideTones: boolean;
  gravity: boolean;
  beatGrid: boolean;
  voicingStaff: boolean;
}

interface OverlayTogglesProps {
  state: OverlayState;
  onChange: (next: OverlayState) => void;
}

const TOGGLES: { key: keyof OverlayState; label: string }[] = [
  { key: "guideTones", label: "Guide tones" },
  { key: "gravity", label: "Chord tone gravity" },
  { key: "voicingStaff", label: "Voicing staff" },
  { key: "beatGrid", label: "Beat grid" },
];

export function OverlayToggles({ state, onChange }: OverlayTogglesProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderRadius: 6,
        overflow: "hidden",
        border: `1px solid #2e2e3e`,
        width: "fit-content",
        marginBottom: 8,
      }}
    >
      {TOGGLES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange({ ...state, [key]: !state[key] })}
          style={{
            padding: "4px 12px",
            background: state[key] ? "#1a1a24" : "transparent",
            color: state[key] ? AMBER : DIM,
            border: "none",
            borderRight: "1px solid #2e2e3e",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: state[key] ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
