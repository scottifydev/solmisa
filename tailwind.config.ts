import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces (brand names)
        night: "#08080c",
        obsidian: "#0f0f16",
        slate: "#181821",
        graphite: "#22222f",
        steel: "#2e2e3e",

        // Text
        ivory: "#eae8e4",
        silver: "#a09bb3",
        ash: "#65607a",
        shadow: "#3d3852",

        // Coral system (primary accent — override of spec's violet)
        coral: {
          DEFAULT: "#FF6B6B",
          bright: "#FF8A8A",
          dim: "#CC5555",
          ghost: "rgba(255,107,107,0.08)",
        },

        // Semantic (full + dim variants for backgrounds)
        correct: {
          DEFAULT: "#4ade80",
          dim: "rgba(74,222,128,0.10)",
        },
        warning: {
          DEFAULT: "#fbbf24",
          dim: "rgba(251,191,36,0.10)",
        },
        incorrect: {
          DEFAULT: "#f87171",
          dim: "rgba(248,113,113,0.10)",
        },
        info: {
          DEFAULT: "#60a5fa",
          dim: "rgba(96,165,250,0.10)",
        },

        // Scale degrees — diatonic
        degree: {
          1: "#e2e2e2",
          2: "#ff6b9d",
          3: "#a78bfa",
          4: "#60a5fa",
          5: "#34d399",
          6: "#f59e0b",
          7: "#ef4444",
        },

        // Scale degrees — chromatic (Module 5+)
        "degree-flat": {
          2: "#e74c6f",
          3: "#c084fc",
          6: "#fbbf24",
          7: "#f97316",
        },
        "degree-sharp": {
          4: "#38bdf8",
        },

        // SRS stages
        srs: {
          apprentice: "#f87171",
          journeyman: "#fbbf24",
          adept: "#34d399",
          virtuoso: "#60a5fa",
          mastered: "#b794f6",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        xxxl: "64px",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.3)",
        elevated: "0 4px 16px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
