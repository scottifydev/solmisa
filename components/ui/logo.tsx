"use client";

interface LogoProps {
  size?: number;
  glow?: boolean;
  withWordmark?: boolean;
  wordmarkSize?: number;
  layout?: "horizontal" | "stacked";
}

export function Logo({
  size = 32,
  glow = false,
  withWordmark = false,
  wordmarkSize,
  layout = "horizontal",
}: LogoProps) {
  const textSize = wordmarkSize ?? size * 0.6;

  return (
    <div
      className={`inline-flex items-center gap-2 ${
        layout === "stacked" ? "flex-col" : "flex-row"
      }`}
    >
      <div className="relative">
        {glow && (
          <div
            className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-coral to-amber opacity-40"
            style={{ width: size, height: size }}
          />
        )}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FFB347" />
            </linearGradient>
          </defs>
          {/* Notched ring */}
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="url(#logo-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="220 44"
          />
        </svg>
      </div>
      {withWordmark && (
        <span
          className="font-display font-bold bg-gradient-to-r from-coral to-amber bg-clip-text text-transparent"
          style={{ fontSize: textSize }}
        >
          solmisa
        </span>
      )}
    </div>
  );
}
