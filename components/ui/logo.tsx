"use client";

import { useId } from "react";

interface LogoProps {
  size?: number;
  glow?: boolean;
  bgOverride?: string;
  withWordmark?: boolean;
  wordmarkSize?: "sm" | "md" | "lg";
  layout?: "horizontal" | "stacked";
}

const DEGREE_GRADIENT = "conic-gradient(from 0deg, #e2e2e2, #ff6b9d, #a78bfa, #60a5fa, #34d399, #f59e0b, #ef4444, #e2e2e2)";
const GLOW_GRADIENT = "conic-gradient(from 0deg, #f0f0f0, #ff85b1, #c4a0ff, #7bb8ff, #5ce8a8, #ffc44d, #ff6b6b, #f0f0f0)";

const WORDMARK_SIZES = { sm: 16, md: 20, lg: 28 } as const;

export function Logo({
  size = 32,
  glow = false,
  bgOverride,
  withWordmark = false,
  wordmarkSize = "md",
  layout = "horizontal",
}: LogoProps) {
  const uid = useId().replace(/:/g, "");
  const maskId = `notchMask-${uid}`;
  const filterId = `glow-${uid}`;

  const cx = size / 2;
  const cy = size / 2;
  const ringOuter = size * 0.42;
  const ringInner = size * 0.28;
  const borderROut = size * 0.44;
  const borderRIn = ringInner - 2;
  const notchWidth = size * 0.025;
  const centerFill = bgOverride ?? "#08080c";

  const borderStroke = glow ? "rgba(204,85,85,0.53)" : "rgba(101,96,122,0.27)";
  const gradient = glow ? GLOW_GRADIENT : DEGREE_GRADIENT;

  const textSize = WORDMARK_SIZES[wordmarkSize];
  const gap = wordmarkSize === "lg" ? 12 : 10;

  return (
    <div
      className={`inline-flex items-center ${
        layout === "stacked" ? "flex-col" : "flex-row"
      }`}
      style={{ gap: layout === "stacked" ? 4 : gap }}
    >
      <div className="relative shrink-0">
        {glow && (
          <div
            className="absolute rounded-full blur-md opacity-30"
            style={{
              width: size + 12,
              height: size + 12,
              left: -6,
              top: -6,
              background: "radial-gradient(circle, rgba(255,107,107,0.4) 0%, transparent 70%)",
            }}
          />
        )}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id={maskId}>
              {/* White outer circle */}
              <circle cx={cx} cy={cy} r={ringOuter} fill="white" />
              {/* Black inner circle to punch hole */}
              <circle cx={cx} cy={cy} r={ringInner} fill="black" />
              {/* 7 black lines radiating from center for notches */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
                const x1 = cx + Math.cos(angle) * (ringInner * 0.85);
                const y1 = cy + Math.sin(angle) * (ringInner * 0.85);
                const x2 = cx + Math.cos(angle) * (ringOuter + 4);
                const y2 = cy + Math.sin(angle) * (ringOuter + 4);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="black"
                    strokeWidth={notchWidth}
                  />
                );
              })}
            </mask>
            {glow && (
              <filter id={filterId}>
                <feGaussianBlur stdDeviation={size * 0.04} />
                <feComposite in="SourceGraphic" />
              </filter>
            )}
          </defs>

          {/* Center fill */}
          <circle cx={cx} cy={cy} r={ringInner} fill={centerFill} />

          {/* Gradient ring via foreignObject + mask */}
          <foreignObject
            x={0}
            y={0}
            width={size}
            height={size}
            mask={`url(#${maskId})`}
          >
            <div
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: gradient,
              }}
            />
          </foreignObject>

          {/* Outer border */}
          <circle
            cx={cx}
            cy={cy}
            r={borderROut}
            fill="none"
            stroke={borderStroke}
            strokeWidth={1}
          />

          {/* Inner border */}
          {borderRIn > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={borderRIn}
              fill="none"
              stroke={borderStroke}
              strokeWidth={1}
            />
          )}

          {/* Glow ring */}
          {glow && (
            <circle
              cx={cx}
              cy={cy}
              r={ringOuter + 6}
              fill="none"
              stroke="rgba(255,107,107,0.12)"
              strokeWidth={8}
              filter={`url(#${filterId})`}
            />
          )}
        </svg>
      </div>

      {withWordmark && (
        <span
          className="font-display text-ivory"
          style={{
            fontSize: textSize,
            fontWeight: 800,
            letterSpacing: wordmarkSize === "sm" ? "-0.5px" : "-0.3px",
          }}
        >
          solmisa
        </span>
      )}
    </div>
  );
}
