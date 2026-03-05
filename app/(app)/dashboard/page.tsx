import type { Metadata } from "next";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getProfile } from "@/lib/actions/profile";
import { getRadarScores } from "@/lib/actions/radar";
import { getNextTrickleQuestion } from "@/lib/actions/assessment";
import { getRecentActivities, getWeeklySummary } from "@/lib/actions/activity";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBar } from "@/components/landing/srs-bar";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { TrickleQuestion } from "@/components/assessment/trickle-question";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { LogActivityButton } from "@/components/activity/log-activity-button";
import { colors } from "@/lib/tokens";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [
    stats,
    profile,
    radarScores,
    trickleQuestion,
    recentActivities,
    weeklySummary,
  ] = await Promise.all([
    getDashboardStats(),
    getProfile(),
    getRadarScores(),
    getNextTrickleQuestion(),
    getRecentActivities(),
    getWeeklySummary(),
  ]);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const greeting = profile?.name
    ? `Good ${timeOfDay}, ${profile.name}`
    : "Welcome back";

  const accuracy =
    stats.weekAccuracy !== null ? `${stats.weekAccuracy}%` : "--";

  return (
    <div className="px-6 py-8 max-w-[960px] mx-auto space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-[26px] font-bold text-ivory tracking-tight">
          {greeting}
        </h1>
        <p className="text-silver/60 text-[13px] font-mono mt-1">
          {stats.dueToday} reviews due &bull; {stats.totalCards} total cards
        </p>
      </div>

      {/* Side-by-side CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {stats.dueToday > 0 ? (
          <Link
            href="/review"
            className="flex-1 p-4 sm:p-5 rounded-xl border border-violet/20 bg-gradient-to-br from-violet/8 to-warning/5 hover:from-violet/15 hover:to-warning/10 transition-all flex items-center gap-3"
          >
            <span className="text-2xl shrink-0">&#x1F504;</span>
            <div>
              <div className="text-[15px] font-bold text-ivory font-body">
                Start Reviews
              </div>
              <div className="text-[12px] text-violet font-mono">
                {stats.dueToday} items due now
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 p-4 sm:p-5 rounded-xl border border-steel bg-obsidian flex items-center gap-3 opacity-60">
            <span className="text-2xl shrink-0">&#x2705;</span>
            <div>
              <div className="text-[15px] font-bold text-ivory font-body">
                All caught up
              </div>
              <div className="text-[12px] text-silver font-mono">
                No reviews due
              </div>
            </div>
          </div>
        )}
        <Link
          href="/learn"
          className="flex-1 p-4 sm:p-5 rounded-xl border border-violet/20 bg-gradient-to-br from-violet/10 to-transparent hover:from-violet/15 transition-all flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">&#x1F4D6;</span>
          <div>
            <div className="text-[15px] font-bold text-ivory font-body">
              Continue Lesson
            </div>
            <div className="text-[12px] text-violet/70 font-mono">
              Pick up where you left off
            </div>
          </div>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Reviews Today"
          value={stats.reviewsToday}
          sub={`${stats.dueToday} due`}
          color={colors.violet}
        />
        <StatCard
          label="7-Day Accuracy"
          value={accuracy}
          color={colors.correct}
        />
        <StatCard
          label="Items Mastered"
          value={stats.byStage.find((s) => s.stage === "mastered")?.count ?? 0}
          sub={`of ${stats.totalCards} total`}
          color={colors.violet}
        />
        <StatCard
          label="Streak"
          value={`${stats.streakDays}d`}
          color={colors.warning}
        />
      </div>

      {/* Skill Radar */}
      <SkillRadar
        current={radarScores.current}
        lifetime={radarScores.lifetime}
        emptyMessage="Complete lessons to build your skill profile"
      />

      {/* Trickle assessment question */}
      {trickleQuestion && <TrickleQuestion question={trickleQuestion} />}

      {/* SRS breakdown */}
      {stats.totalCards > 0 ? (
        <div className="rounded-xl border border-steel bg-obsidian p-5">
          <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
            SRS Progress
          </div>
          <SrsBar
            stages={stats.byStage.map((s) => ({
              stage: s.stage,
              count: s.count,
            }))}
            total={stats.totalCards}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-steel bg-obsidian p-5">
          <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
            SRS Progress
          </div>
          <p className="text-silver text-sm">
            No cards yet. Complete lessons to start building your review deck.
          </p>
        </div>
      )}

      {/* Weekly summary + Activity feed */}
      <div className="rounded-xl border border-steel bg-obsidian p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono">
            This Week
          </div>
          <div className="hidden sm:block">
            <LogActivityButton />
          </div>
        </div>
        {weeklySummary.activityCount > 0 ? (
          <div className="flex gap-4 mb-4 text-sm">
            <div>
              <span className="text-ivory font-bold">
                {weeklySummary.totalMinutes}
              </span>
              <span className="text-silver/60 ml-1">min</span>
            </div>
            <div>
              <span className="text-ivory font-bold">
                {weeklySummary.activityCount}
              </span>
              <span className="text-silver/60 ml-1">activities</span>
            </div>
          </div>
        ) : null}
        <ActivityFeed activities={recentActivities} />
      </div>

      {/* Floating log button (mobile) */}
      <div className="sm:hidden">
        <LogActivityButton />
      </div>
    </div>
  );
}
