"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { brand } from "@/lib/tokens";

interface FeedbackWhyProps {
  whyText: string;
  topicSlug?: string;
  showExploreLink?: boolean;
}

export function FeedbackWhy({
  whyText,
  topicSlug,
  showExploreLink,
}: FeedbackWhyProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [whyText, topicSlug, showExploreLink]);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs font-medium italic transition-opacity hover:opacity-80"
        style={{ color: brand.silver }}
      >
        {open ? "Why?" : "Why?"}
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? `${contentHeight}px` : "0px" }}
      >
        <div
          ref={contentRef}
          className="mt-2 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: brand.graphite }}
        >
          <p className="text-sm leading-relaxed" style={{ color: brand.ivory }}>
            {whyText}
          </p>
          {showExploreLink && topicSlug && (
            <Link
              href={`/flow/explore/${topicSlug}`}
              className="mt-2 inline-block text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ color: brand.violet }}
            >
              Explore this topic
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
