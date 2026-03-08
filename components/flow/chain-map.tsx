"use client";

import { brand, srsStageColors, srsStageLabels } from "@/lib/tokens";
import { stageToGroup } from "@/lib/srs/stages";
import type { SrsStageKey, SrsStageGroup } from "@/types/srs";

interface ChainMapLink {
  position: number;
  description: string;
  srsStage: SrsStageKey | null;
  isUnlocked: boolean;
}

interface ChainMapProps {
  chain: {
    name: string;
    slug: string;
    rootKey: string;
    totalLinks: number;
  };
  links: ChainMapLink[];
  onNodeTap?: (chainSlug: string, position: number) => void;
}

function getNodeStyle(link: ChainMapLink): {
  bg: string;
  border: string;
  text: string;
  glow: boolean;
} {
  if (!link.isUnlocked) {
    return {
      bg: brand.graphite,
      border: brand.steel,
      text: brand.ash,
      glow: false,
    };
  }

  if (!link.srsStage) {
    return {
      bg: "transparent",
      border: brand.violet,
      text: brand.violet,
      glow: true,
    };
  }

  const group = stageToGroup(link.srsStage);
  const color = srsStageColors[group];

  return {
    bg: color + "25",
    border: color,
    text: color,
    glow: false,
  };
}

function getGroupLabel(stage: SrsStageKey): string {
  const group: SrsStageGroup = stageToGroup(stage);
  return srsStageLabels[group];
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChainMap({ chain, links, onNodeTap }: ChainMapProps) {
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Header */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold" style={{ color: brand.ivory }}>
          {chain.name}
        </h3>
        <span className="text-xs" style={{ color: brand.ash }}>
          {chain.rootKey}
        </span>
      </div>

      {/* Vertical node list */}
      {links.map((link, i) => {
        const style = getNodeStyle(link);
        const isLast = i === links.length - 1;
        const isMastered = link.srsStage === "mastered";

        return (
          <div key={link.position} className="flex flex-col items-center">
            {/* Node row */}
            <button
              onClick={() =>
                link.isUnlocked && onNodeTap?.(chain.slug, link.position)
              }
              disabled={!link.isUnlocked || !onNodeTap}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all"
              style={{
                cursor: link.isUnlocked && onNodeTap ? "pointer" : "default",
                minWidth: 220,
              }}
            >
              {/* Circle node */}
              <div
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
                style={{
                  backgroundColor: style.bg,
                  border: `2px solid ${style.border}`,
                  boxShadow: style.glow ? `0 0 12px ${brand.violet}40` : "none",
                }}
              >
                {!link.isUnlocked ? (
                  <span style={{ color: style.text }}>
                    <LockIcon />
                  </span>
                ) : isMastered ? (
                  <span style={{ color: srsStageColors.mastered }}>
                    <CheckIcon />
                  </span>
                ) : (
                  <span
                    className="text-sm font-bold"
                    style={{ color: style.text }}
                  >
                    {link.position}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col text-left">
                {link.isUnlocked ? (
                  <>
                    <span
                      className="text-sm font-medium"
                      style={{ color: brand.ivory }}
                    >
                      {link.description}
                    </span>
                    {link.srsStage && (
                      <span className="text-xs" style={{ color: style.text }}>
                        {getGroupLabel(link.srsStage)}
                      </span>
                    )}
                    {!link.srsStage && (
                      <span className="text-xs" style={{ color: brand.ash }}>
                        Ready to start
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm" style={{ color: brand.ash }}>
                    Locked
                  </span>
                )}
              </div>
            </button>

            {/* Connecting line */}
            {!isLast &&
              (() => {
                const bothUnlocked =
                  link.isUnlocked && links[i + 1]?.isUnlocked;
                return (
                  <div
                    className="my-0.5 h-5 w-px"
                    style={
                      bothUnlocked
                        ? { backgroundColor: brand.violet }
                        : {
                            backgroundImage: `repeating-linear-gradient(to bottom, ${brand.steel} 0px, ${brand.steel} 3px, transparent 3px, transparent 6px)`,
                            opacity: 0.4,
                          }
                    }
                  />
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}
