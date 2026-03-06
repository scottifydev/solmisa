"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { colors } from "@/lib/tokens";
import {
  DEMO_STATS,
  DEMO_REVIEW_CARDS,
  DEMO_RADAR_SCORES,
} from "@/lib/data/demo-data";
import { SrsBar } from "./srs-bar";
import { AnonymousReviewSession } from "./anonymous-review-session";
import { DemoLesson } from "./demo-lesson";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { AudioProvider } from "@/components/audio-provider";

type View = "dashboard" | "review" | "lesson";

export function LandingDashboard() {
  const [view, setView] = useState<View>("dashboard");

  if (view === "review") {
    return (
      <main className="px-6 py-8 max-w-[500px] mx-auto">
        <button
          onClick={() => setView("dashboard")}
          className="text-silver hover:text-ivory transition-colors text-sm font-mono mb-6"
        >
          &larr; Back to dashboard
        </button>
        <AnonymousReviewSession cards={DEMO_REVIEW_CARDS} />
      </main>
    );
  }

  if (view === "lesson") {
    return (
      <AudioProvider>
        <main className="px-6 py-8 max-w-[500px] mx-auto">
          <DemoLesson
            onBack={() => setView("dashboard")}
            onComplete={() => setView("dashboard")}
          />
        </main>
      </AudioProvider>
    );
  }

  return (
    <main className="px-6 py-8 max-w-[960px] mx-auto space-y-5">
      {/* Greeting area */}
      <div>
        <h1 className="font-display text-[26px] font-bold text-ivory tracking-tight">
          Train your ear, built on research
        </h1>
        <p className="text-ash text-[13px] font-mono mt-1">
          Here&apos;s what your daily practice looks like
        </p>
      </div>

      {/* Side-by-side CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setView("review")}
          className="flex-1 p-4 sm:p-5 rounded-xl border border-violet/20 bg-gradient-to-br from-violet/8 to-warning/5 hover:from-violet/15 hover:to-warning/10 transition-all cursor-pointer text-left flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">&#x1F504;</span>
          <div>
            <div className="text-[15px] font-bold text-ivory font-body">
              Start Reviews
            </div>
            <div className="text-[12px] text-violet font-mono">
              {DEMO_STATS.dueToday} items due now
            </div>
          </div>
        </button>
        <button
          onClick={() => setView("lesson")}
          className="flex-1 p-4 sm:p-5 rounded-xl border border-violet/20 bg-gradient-to-br from-violet/10 to-transparent hover:from-violet/15 transition-all cursor-pointer text-left flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">&#x1F4D6;</span>
          <div>
            <div className="text-[15px] font-bold text-ivory font-body">
              Start Lesson
            </div>
            <div className="text-[12px] text-violet/70 font-mono">
              Meet Do &mdash; your first degree
            </div>
          </div>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Reviews Today"
          value={DEMO_STATS.reviewsToday}
          sub={`${DEMO_STATS.dueToday} due`}
          color={colors.violet}
        />
        <StatCard
          label="7-Day Accuracy"
          value="84%"
          sub="demo data"
          color={colors.correct}
        />
        <StatCard
          label="Items Mastered"
          value="1"
          sub={`of ${DEMO_STATS.totalCards} total`}
          color={colors.violet}
        />
        <StatCard
          label="Streak"
          value={`${DEMO_STATS.streakDays}d`}
          sub="best: 14d"
          color={colors.warning}
        />
      </div>

      {/* Skill Radar */}
      <SkillRadar
        current={DEMO_RADAR_SCORES}
        lifetime={DEMO_RADAR_SCORES}
        emptyMessage="Complete lessons to build your skill profile"
      />

      {/* SRS breakdown */}
      <SrsProgressSection />

      {/* Signup CTA */}
      <Link
        href="/signup"
        className="block rounded-xl border border-violet/20 bg-gradient-to-r from-violet/5 to-warning/5 hover:from-violet/10 hover:to-warning/10 transition-colors p-6 text-center"
      >
        <h2 className="font-display text-lg font-bold text-ivory">
          Sign up free to save your progress
        </h2>
        <p className="text-silver text-sm mt-1">
          Your review stats, streak, and mastery &mdash; all saved
          automatically.
        </p>
      </Link>
    </main>
  );
}

function SrsProgressSection() {
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div className="rounded-xl border border-steel bg-obsidian p-5">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="text-[10px] tracking-[1.5px] uppercase text-ash font-mono">
          Review Progress
        </div>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="text-[10px] text-violet/70 hover:text-violet font-mono transition-colors"
        >
          {showExplainer ? "Hide" : "What\u2019s this?"}
        </button>
      </div>
      {showExplainer && (
        <p className="text-silver text-xs leading-relaxed mb-3">
          Items move through five stages as you learn them. New items start at
          the beginning and advance as you answer correctly over time. The
          further along an item is, the less often you need to review it.
        </p>
      )}
      <SrsBar
        stages={DEMO_STATS.byStage.map((s) => ({
          stage: s.stage,
          count: s.count,
        }))}
        total={DEMO_STATS.totalCards}
        plainLabels
      />
    </div>
  );
}
