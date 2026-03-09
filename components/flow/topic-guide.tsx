"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { brand } from "@/lib/tokens";
import * as Tone from "tone";
import type { TopicGuide } from "@/lib/flow/topic-guides";
import { playAudioConfig } from "@/lib/audio/flow-audio-pipeline";
import { PlaybackEngine } from "@/lib/audio/playback";

interface TopicGuideProps {
  guide: TopicGuide;
  isNew?: boolean;
}

export function TopicGuideCard({ guide, isNew }: TopicGuideProps) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const handlePlay = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) return;
      setIsPlaying(true);
      try {
        await Tone.start();
        if (!engineRef.current) {
          engineRef.current = new PlaybackEngine();
        }
        await playAudioConfig(engineRef.current, guide.audioConfig);
      } catch (err) {
        console.warn("Topic guide audio playback failed:", err);
      }
      setIsPlaying(false);
    },
    [isPlaying, guide.audioConfig],
  );

  return (
    <div
      style={{
        backgroundColor: brand.graphite,
        borderRadius: "12px",
        border: `1px solid ${isNew ? brand.violet + "60" : brand.steel}`,
        overflow: "hidden",
        transition: "border-color 0.3s ease",
      }}
    >
      <button
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: "12px",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                color: brand.ivory,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {guide.displayName}
            </span>
            {isNew && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: brand.violet,
                  backgroundColor: brand.violet + "18",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  boxShadow: `0 0 8px ${brand.violet}40`,
                  whiteSpace: "nowrap",
                }}
              >
                just unlocked
              </span>
            )}
          </div>
          <span
            style={{
              color: brand.silver,
              fontSize: "13px",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            {guide.oneLiner}
          </span>
        </div>
        <ChevronIcon expanded={expanded} />
      </button>

      <div
        style={{
          maxHeight: expanded ? `${contentHeight}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: "0 16px 16px",
          }}
        >
          <div
            style={{
              borderTop: `1px solid ${brand.steel}`,
              paddingTop: "12px",
            }}
          >
            <p
              style={{
                color: brand.ivory,
                fontSize: "13px",
                lineHeight: 1.65,
                margin: "0 0 12px",
              }}
            >
              {guide.paragraph}
            </p>
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: `1.5px solid ${isPlaying ? brand.violet : brand.steel}`,
                backgroundColor: isPlaying ? brand.violet + "20" : brand.slate,
                color: isPlaying ? brand.violet : brand.silver,
                fontSize: "12px",
                fontWeight: 600,
                cursor: isPlaying ? "default" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {isPlaying ? <PlayingIndicator /> : <PlayIcon />}
              {isPlaying ? "Playing..." : "Listen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={brand.ash}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.3s ease",
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PlayingIndicator() {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="animate-pulse"
          style={{
            display: "inline-block",
            height: "10px",
            width: "2px",
            borderRadius: "9999px",
            backgroundColor: brand.violet,
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
    </span>
  );
}
