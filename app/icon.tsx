import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const DEGREE_COLORS = [
  "#e2e2e2",
  "#ff6b9d",
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#f59e0b",
  "#ef4444",
];

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default function Icon() {
  const s = 32;
  const cx = s / 2;
  const cy = s / 2;
  const outerR = s * 0.42;
  const innerR = s * 0.28;
  const midR = (outerR + innerR) / 2;
  const ringWidth = outerR - innerR;
  const segmentCount = 7;
  const gapAngle = 0.08;
  const segmentAngle = (Math.PI * 2) / segmentCount;
  const startOffset = -Math.PI / 2;

  const segments = DEGREE_COLORS.map((color, i) => {
    const start = startOffset + i * segmentAngle + gapAngle / 2;
    const end = startOffset + (i + 1) * segmentAngle - gapAngle / 2;
    return (
      <path
        key={i}
        d={arcPath(cx, cy, midR, start, end)}
        stroke={color}
        strokeWidth={ringWidth}
        fill="none"
        strokeLinecap="butt"
      />
    );
  });

  return new ImageResponse(
    <div
      style={{
        width: s,
        height: s,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx={cx} cy={cy} r={innerR} fill="#08080c" />
        {segments}
      </svg>
    </div>,
    { ...size },
  );
}
