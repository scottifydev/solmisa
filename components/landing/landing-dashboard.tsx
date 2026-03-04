"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { colors, srsStageColors } from "@/lib/tokens";
import { DEMO_STATS, DEMO_REVIEW_CARDS } from "@/lib/data/demo-data";
import { AnonymousReviewSession } from "./anonymous-review-session";

export function LandingDashboard() {
  const [showReview, setShowReview] = useState(false);

  if (showReview) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <button
          onClick={() => setShowReview(false)}
          className="text-silver hover:text-ivory transition-colors text-sm mb-4"
        >
          &larr; Back to dashboard
        </button>
        <AnonymousReviewSession cards={DEMO_REVIEW_CARDS} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero banner */}
      <div className="rounded-xl border border-steel bg-charcoal p-6 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ivory">
          Train your ear with spaced repetition, built on research.
        </h1>
        <p className="text-silver">
          Try the demo below &mdash; no account needed.
        </p>
        <Link
          href="/framework"
          className="inline-block text-coral text-sm hover:text-coral/80 transition-colors mt-1"
        >
          For the music teachers and theory nerds &rarr;
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Cards Due" value={DEMO_STATS.dueToday} color={colors.coral} />
        <StatCard label="Total Cards" value={DEMO_STATS.totalCards} />
        <StatCard label="Reviews Today" value={DEMO_STATS.reviewsToday} />
        <StatCard label="Streak" value={`${DEMO_STATS.streakDays}d`} color={colors.amber} />
      </div>

      {/* Review CTA */}
      <button
        onClick={() => setShowReview(true)}
        className="block w-full text-left rounded-xl border border-coral/30 bg-coral/5 p-6 hover:bg-coral/10 transition-colors animate-pulse-subtle"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ivory">
              {DEMO_STATS.dueToday} cards ready for review
            </h2>
            <p className="text-silver text-sm mt-1">
              Flip cards and test yourself &mdash; try it now
            </p>
          </div>
          <span className="text-coral text-2xl">&rarr;</span>
        </div>
      </button>

      {/* SRS Stage breakdown */}
      <div className="rounded-xl border border-steel bg-charcoal p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-4">Card Mastery</h2>
        <div className="space-y-3">
          {DEMO_STATS.byStage.map((group) => (
            <div key={group.stage} className="flex items-center gap-3">
              <SrsBadge stage={group.stage} size="sm" />
              <div className="flex-1">
                <ProgressBar
                  value={group.count}
                  max={DEMO_STATS.totalCards}
                  color={srsStageColors[group.stage]}
                  size="sm"
                />
              </div>
              <span className="text-silver text-xs font-mono w-8 text-right">
                {group.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inline signup CTA */}
      <Link
        href="/signup"
        className="block rounded-xl border border-coral/20 bg-gradient-to-r from-coral/5 to-amber/5 p-6 hover:from-coral/10 hover:to-amber/10 transition-colors text-center"
      >
        <h2 className="font-display text-lg font-bold text-ivory">
          Sign up free to save your progress and unlock lessons
        </h2>
        <p className="text-silver text-sm mt-1">
          Your review stats, streak, and mastery &mdash; all saved automatically.
        </p>
      </Link>

      {/* Quick links (locked) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/signup"
          className="rounded-xl border border-steel bg-charcoal p-6 hover:border-silver transition-colors relative"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-ivory">Continue Learning</h3>
            <svg className="w-4 h-4 text-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-silver text-sm mt-1">
            Sign up to unlock the full curriculum
          </p>
        </Link>
        <Link
          href="/signup"
          className="rounded-xl border border-steel bg-charcoal p-6 hover:border-silver transition-colors relative"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-ivory">Your Profile</h3>
            <svg className="w-4 h-4 text-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-silver text-sm mt-1">
            Sign up to track your stats and settings
          </p>
        </Link>
      </div>
    </div>
  );
}
