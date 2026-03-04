import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0A0A0F",
        obsidian: "#141420",
        charcoal: "#1E1E2E",
        steel: "#2A2A3D",
        silver: "#9999AA",
        ivory: "#F5F5F0",
        coral: "#FF6B6B",
        amber: "#FFB347",
        "degree-1": "#FF6B6B",
        "degree-2": "#FFB347",
        "degree-3": "#4ECDC4",
        "degree-4": "#45B7D1",
        "degree-5": "#96E6A1",
        "degree-6": "#DDA0DD",
        "degree-7": "#F7DC6F",
        "srs-apprentice": "#4ECDC4",
        "srs-journeyman": "#45B7D1",
        "srs-adept": "#96E6A1",
        "srs-virtuoso": "#DDA0DD",
        "srs-mastered": "#FFD700",
        correct: "#4ECDC4",
        incorrect: "#FF6B6B",
        warning: "#FFB347",
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
