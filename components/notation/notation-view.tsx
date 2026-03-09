"use client";

import { useRef, useEffect, useCallback } from "react";
import type { NotationData, NoteEvent } from "@/lib/notation/types";
import {
  renderNotation,
  type RenderedNote,
} from "@/lib/notation/vexflow-renderer";
import { degreeColors as defaultDegreeColors } from "@/lib/tokens";

interface NotationViewProps {
  data: NotationData;
  width?: number;
  interactive?: boolean;
  highlightDegrees?: boolean;
  degreeColors?: Record<number, string>;
  onNoteClick?: (note: NoteEvent) => void;
  playbackPosition?: number;
  className?: string;
}

export function NotationView({
  data,
  width,
  interactive = false,
  highlightDegrees = false,
  degreeColors = defaultDegreeColors,
  onNoteClick,
  playbackPosition,
  className,
}: NotationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedNotesRef = useRef<RenderedNote[]>([]);
  const cursorRef = useRef<SVGLineElement | null>(null);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!interactive || !onNoteClick) return;

      const target = e.target as SVGElement;
      const svg = containerRef.current?.querySelector("svg");
      if (!svg) return;

      for (const { note, event } of renderedNotesRef.current) {
        const svgEl = note.getSVGElement();
        if (svgEl && (svgEl === target || svgEl.contains(target))) {
          onNoteClick(event);
          return;
        }
      }

      // Fall back to bounding box hit test for larger touch targets
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      for (const { note, event } of renderedNotesRef.current) {
        try {
          const bb = note.getBoundingBox();
          const x = bb.getX();
          const y = bb.getY();
          const w = bb.getW();
          const h = bb.getH();
          // 44px minimum touch target
          const padX = Math.max(0, (44 - w) / 2);
          const padY = Math.max(0, (44 - h) / 2);
          if (
            svgPt.x >= x - padX &&
            svgPt.x <= x + w + padX &&
            svgPt.y >= y - padY &&
            svgPt.y <= y + h + padY
          ) {
            onNoteClick(event);
            return;
          }
        } catch {
          // note may not be fully rendered
        }
      }
    },
    [interactive, onNoteClick],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    cursorRef.current = null;

    const result = renderNotation(container, data, {
      width,
      highlightDegrees,
      degreeColors,
    });

    renderedNotesRef.current = result.renderedNotes;

    // Make SVG responsive via viewBox
    if (result.svg) {
      result.svg.setAttribute(
        "viewBox",
        `0 0 ${result.totalWidth} ${result.totalHeight}`,
      );
      result.svg.style.width = "100%";
      result.svg.style.height = "auto";
      result.svg.style.minHeight = "44px";
      result.svg.style.filter = "drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))";
    }
  }, [data, width, highlightDegrees, degreeColors]);

  // Attach click handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !interactive) return;

    container.addEventListener("click", handleClick);
    container.style.cursor = "pointer";

    return () => {
      container.removeEventListener("click", handleClick);
      container.style.cursor = "";
    };
  }, [interactive, handleClick]);

  // Playback cursor
  useEffect(() => {
    if (playbackPosition == null || playbackPosition < 0) {
      if (cursorRef.current) {
        cursorRef.current.remove();
        cursorRef.current = null;
      }
      return;
    }

    const notes = renderedNotesRef.current;
    if (playbackPosition >= notes.length) return;

    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const targetNote = notes[playbackPosition];
    if (!targetNote) return;
    try {
      const bb = targetNote.note.getBoundingBox();
      const x = bb.getX() + bb.getW() / 2;

      if (!cursorRef.current) {
        const ns = "http://www.w3.org/2000/svg";
        const line = document.createElementNS(ns, "line");
        line.setAttribute("stroke", "#b794f6");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("opacity", "0.7");
        svg.appendChild(line);
        cursorRef.current = line;
      }

      cursorRef.current.setAttribute("x1", String(x));
      cursorRef.current.setAttribute("x2", String(x));
      cursorRef.current.setAttribute("y1", "30");
      cursorRef.current.setAttribute("y2", "130");
    } catch {
      // note not positioned yet
    }
  }, [playbackPosition]);

  return <div ref={containerRef} className={className} style={{}} />;
}
