"use client";

import { useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { colors } from "@/lib/tokens";
import {
  DEMO_STATS,
  DEMO_REVIEW_CARDS,
  DEMO_SKILL_AXES,
} from "@/lib/data/demo-data";
import { SrsBar } from "./srs-bar";
import { AnonymousReviewSession } from "./anonymous-review-session";
import { DemoLesson } from "./demo-lesson";
import { OnboardingTooltip } from "./onboarding-tooltip";
import { SkillRadar } from "@/components/dashboard/skill-radar";

type View = "dashboard" | "review" | "lesson";

export function LandingDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [showDashboardTip, setShowDashboardTip] = useState(true);

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
      <main className="px-6 py-8 max-w-[500px] mx-auto">
        <DemoLesson
          onBack={() => setView("dashboard")}
          onComplete={() => setView("dashboard")}
        />
      </main>
    );
  }

  return (
    <main className="px-6 py-8 max-w-[960px] mx-auto space-y-5">
      {/* Greeting area */}
      <div>
        <h1 className="font-display text-[26px] font-bold text-ivory tracking-tight">
          Train your ear, built on research
        </h1>
        <p className="text-silver/60 text-[13px] font-mono mt-1">
          {DEMO_STATS.dueToday} reviews due &bull; try the demo below
        </p>
      </div>

      {/* Side-by-side CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <button
            onClick={() => {
              setShowDashboardTip(false);
              setView("review");
            }}
            className="w-full p-4 sm:p-5 rounded-xl border border-coral/20 bg-gradient-to-br from-coral/8 to-warning/5 hover:from-coral/15 hover:to-warning/10 transition-all cursor-pointer text-left flex items-center gap-3"
          >
            <span className="text-2xl shrink-0">&#x1F504;</span>
            <div>
              <div className="text-[15px] font-bold text-ivory font-body">
                Start Reviews
              </div>
              <div className="text-[12px] text-coral font-mono">
                {DEMO_STATS.dueToday} items due now
              </div>
            </div>
          </button>
          <OnboardingTooltip
            text="Try a quick review session — test your ear with scale degrees"
            show={showDashboardTip}
            onDismiss={() => setShowDashboardTip(false)}
          />
        </div>
        <button
          onClick={() => setView("lesson")}
          className="flex-1 p-4 sm:p-5 rounded-xl border border-coral/10 bg-gradient-to-br from-coral/4 to-transparent hover:from-coral/8 transition-all cursor-pointer text-left flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">&#x1F4D6;</span>
          <div>
            <div className="text-[15px] font-bold text-ivory font-body">
              Start Lesson
            </div>
            <div className="text-[12px] text-coral/70 font-mono">
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
          color={colors.coral}
        />
        <StatCard
          label="7-Day Accuracy"
          value="84%"
          sub="demo data"
          color="#4ECDC4"
        />
        <StatCard
          label="Items Mastered"
          value="1"
          sub={`of ${DEMO_STATS.totalCards} total`}
          color={colors.coral}
        />
        <StatCard
          label="Streak"
          value={`${DEMO_STATS.streakDays}d`}
          sub="best: 14d"
          color={colors.warning}
        />
      </div>

      {/* Skill Radar */}
      <SkillRadar axes={DEMO_SKILL_AXES} />

      {/* SRS breakdown */}
      <div className="rounded-xl border border-steel bg-obsidian p-5">
        <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
          SRS Progress
        </div>
        <SrsBar
          stages={DEMO_STATS.byStage.map((s) => ({
            stage: s.stage,
            count: s.count,
          }))}
          total={DEMO_STATS.totalCards}
        />
      </div>

      {/* Signup CTA */}
      <Link
        href="/signup"
        className="block rounded-xl border border-coral/20 bg-gradient-to-r from-coral/5 to-warning/5 hover:from-coral/10 hover:to-warning/10 transition-colors p-6 text-center"
      >
        <h2 className="font-display text-lg font-bold text-ivory">
          Sign up free to save your progress
        </h2>
        <p className="text-silver text-sm mt-1">
          Your review stats, streak, and mastery &mdash; all saved
          automatically.
        </p>
      </Link>

      {/* Framework link */}
      <div className="text-center">
        <Link
          href="/framework"
          className="text-coral/70 text-sm hover:text-coral transition-colors font-body"
        >
          For the music teachers and theory nerds &rarr;
        </Link>
      </div>
    </main>
  );
}
