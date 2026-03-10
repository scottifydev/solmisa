"use client";

import { useState, useRef, useCallback } from "react";
import { brand } from "@/lib/tokens";
import { IDontKnowButton } from "./i-dont-know-button";

interface DragRankItem {
  id: string;
  label: string;
}

interface DragRankProps {
  prompt: string;
  items: DragRankItem[];
  correctOrder: string[];
  onAnswer: (correct: boolean) => void;
}

export function DragRank({
  prompt,
  items,
  correctOrder,
  onAnswer,
}: DragRankProps) {
  const [order, setOrder] = useState<DragRankItem[]>(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [tapSelected, setTapSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[] | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const touchStartY = useRef(0);
  const touchItemIndex = useRef<number | null>(null);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      if (moved) next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  // Desktop drag-and-drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndex;
    if (fromIndex !== null) {
      moveItem(fromIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartY.current = touch.clientY;
    touchItemIndex.current = index;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchItemIndex.current === null) return;
    const touch = e.touches[0];
    if (!touch || !listRef.current) return;

    const items = listRef.current.querySelectorAll("[data-rank-item]");
    for (let i = 0; i < items.length; i++) {
      const rect = items[i]!.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setOverIndex(i);
        setDragIndex(touchItemIndex.current);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    if (touchItemIndex.current !== null && overIndex !== null) {
      moveItem(touchItemIndex.current, overIndex);
    }
    touchItemIndex.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  // Tap-to-swap (mobile fallback)
  const handleTap = (index: number) => {
    if (submitted) return;
    if (tapSelected === null) {
      setTapSelected(index);
    } else {
      moveItem(tapSelected, index);
      setTapSelected(null);
    }
  };

  // Keyboard reorder
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (submitted) return;
    if (e.key === "ArrowUp" && index > 0) {
      e.preventDefault();
      moveItem(index, index - 1);
      // Focus the moved item at its new position
      setTimeout(() => {
        const items = listRef.current?.querySelectorAll("[data-rank-item]");
        (items?.[index - 1] as HTMLElement)?.focus();
      }, 0);
    } else if (e.key === "ArrowDown" && index < order.length - 1) {
      e.preventDefault();
      moveItem(index, index + 1);
      setTimeout(() => {
        const items = listRef.current?.querySelectorAll("[data-rank-item]");
        (items?.[index + 1] as HTMLElement)?.focus();
      }, 0);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleTap(index);
    }
  };

  const handleCheck = () => {
    const currentIds = order.map((item) => item.id);
    const itemResults = currentIds.map((id, i) => id === correctOrder[i]);
    setResults(itemResults);
    setSubmitted(true);

    const allCorrect = itemResults.every(Boolean);

    if (!allCorrect) {
      // Animate to correct order after a delay
      setTimeout(() => {
        const corrected = correctOrder
          .map((id) => order.find((item) => item.id === id))
          .filter(Boolean) as DragRankItem[];
        setOrder(corrected);
        setResults(corrected.map(() => true));
      }, 1500);
    }

    setTimeout(() => onAnswer(allCorrect), allCorrect ? 800 : 2500);
  };

  const handleDontKnow = () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      <p
        className="text-center text-sm font-medium"
        style={{ color: brand.ivory }}
      >
        {prompt}
      </p>

      <ul
        ref={listRef}
        className="flex flex-col gap-2"
        role="listbox"
        aria-label={prompt}
      >
        {order.map((item, index) => {
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;
          const isTapSelected = tapSelected === index;
          const resultColor = results
            ? results[index]
              ? brand.correct
              : brand.incorrect
            : undefined;

          return (
            <li
              key={item.id}
              data-rank-item
              draggable={!submitted}
              role="option"
              tabIndex={submitted ? -1 : 0}
              aria-selected={isTapSelected}
              aria-label={`${item.label}, position ${index + 1} of ${order.length}`}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => handleTap(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 select-none"
              style={{
                backgroundColor: resultColor
                  ? resultColor + "18"
                  : isTapSelected
                    ? brand.violet + "20"
                    : brand.graphite,
                border: `1.5px solid ${
                  resultColor
                    ? resultColor
                    : isOver
                      ? brand.violet
                      : isTapSelected
                        ? brand.violet
                        : brand.steel
                }`,
                opacity: isDragging ? 0.5 : 1,
                cursor: submitted ? "default" : "grab",
                transform: isOver ? "scale(1.02)" : "scale(1)",
              }}
            >
              {/* Grab handle */}
              <span
                className="flex flex-col gap-0.5"
                style={{ color: brand.ash }}
                aria-hidden
              >
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
                <span className="block h-0.5 w-4 rounded-full bg-current" />
              </span>

              {/* Position number */}
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: resultColor
                    ? resultColor + "30"
                    : brand.steel,
                  color: resultColor ?? brand.silver,
                }}
              >
                {index + 1}
              </span>

              {/* Label */}
              <span
                className="flex-1 text-sm font-medium"
                style={{ color: brand.ivory }}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>

      {!submitted && (
        <button
          onClick={handleCheck}
          className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: brand.violet,
            color: brand.night,
          }}
        >
          Check Order
        </button>
      )}
      <IDontKnowButton onDontKnow={handleDontKnow} visible={!submitted} />
    </div>
  );
}
