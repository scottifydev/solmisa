import type { Metadata } from "next";
import {
  getDashboardStats,
  getSmartSuggestion,
  getTrackProgress,
} from "@/lib/actions/dashboard";
import { getProfile } from "@/lib/actions/profile";
import { getRadarScores } from "@/lib/actions/radar";
import { getNextTrickleQuestion } from "@/lib/actions/assessment";
import { getRecentActivities, getWeeklySummary } from "@/lib/actions/activity";
import { getRecommendations } from "@/lib/actions/practice";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBar } from "@/components/landing/srs-bar";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { TrickleQuestion } from "@/components/assessment/trickle-question";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { LogActivityButton } from "@/components/activity/log-activity-button";
import { colors } from "@/lib/tokens";
import Link from "next/link";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [
    stats,
    profile,
    radarScores,
    trickleQuestion,
    recentActivities,
    weeklySummary,
    suggestion,
    trackProgress,
    recommendations,
  ] = await Promise.all([
    getDashboardStats(),
    getProfile(),
    getRadarScores(),
    getNextTrickleQuestion(),
    getRecentActivities(),
    getWeeklySummary(),
    getSmartSuggestion(),
    getTrackProgress(),
    getRecommendations(3),
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
      {/* Greeting + Settings */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[26px] font-bold text-ivory tracking-tight">
          {greeting}
        </h1>
        <Link
          href="/settings"
          className="text-silver hover:text-ivory transition-colors text-sm font-mono"
        >
          Settings
        </Link>
      </div>

      {/* Smart suggestion CTA */}
      <Link
        href={suggestion.href}
        className={`block p-4 sm:p-5 rounded-xl border transition-all ${
          suggestion.type === "review"
            ? "border-violet/20 bg-gradient-to-br from-violet/8 to-warning/5 hover:from-violet/15 hover:to-warning/10"
            : suggestion.type === "track_nudge"
              ? "border-warning/20 bg-gradient-to-br from-warning/8 to-violet/5 hover:from-warning/15"
              : "border-violet/20 bg-gradient-to-br from-violet/10 to-transparent hover:from-violet/15"
        }`}
      >
        <div className="text-[15px] font-bold text-ivory font-body">
          {suggestion.title}
        </div>
        <div className="text-[12px] text-silver/70 font-mono mt-0.5">
          {suggestion.subtitle}
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-body font-semibold text-violet">
          {suggestion.buttonLabel}
          <span aria-hidden="true">&rarr;</span>
        </div>
      </Link>

      {/* Track status strip */}
      {trackProgress.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {trackProgress.map((track) => {
            const pct =
              track.lessonsTotal > 0
                ? Math.round(
                    (track.lessonsCompleted / track.lessonsTotal) * 100,
                  )
                : 0;
            return (
              <Link
                key={track.slug}
                href={`/learn?track=${track.slug}`}
                className="rounded-xl border border-steel bg-obsidian p-3.5 hover:border-violet/30 transition-colors"
              >
                <div className="text-xs font-body text-ivory font-semibold truncate">
                  {track.name}
                </div>
                <div className="mt-2 h-1.5 bg-steel rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-silver/60 font-mono mt-1.5">
                  {track.lessonsCompleted}/{track.lessonsTotal} lessons
                </div>
                {track.currentModule && (
                  <div className="text-[10px] text-ash font-mono truncate mt-0.5">
                    {track.currentModule}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Review stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Reviewed Today"
          value={stats.reviewsToday}
          sub={stats.dueToday > 0 ? `${stats.dueToday} remaining` : "all done"}
          color={colors.violet}
        />
        <StatCard
          label="Weekly Accuracy"
          value={accuracy}
          color={colors.correct}
        />
        <StatCard
          label="Mastered"
          value={stats.byStage.find((s) => s.stage === "mastered")?.count ?? 0}
          sub={`of ${stats.totalCards} items`}
          color={colors.violet}
        />
        <StatCard
          label="Streak"
          value={`${stats.streakDays}d`}
          color={colors.warning}
        />
      </div>

      {/* Skills Radar (full version with expand) */}
      <SkillRadar
        current={radarScores.current}
        lifetime={radarScores.lifetime}
        emptyMessage="Complete lessons to build your skill profile"
      />

      {/* Trickle assessment question */}
      {trickleQuestion && <TrickleQuestion question={trickleQuestion} />}

      {/* Practice recommendations */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-steel bg-obsidian p-5">
          <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
            Recommended Practice
          </div>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-start gap-3 py-2">
                <span className="text-[10px] font-mono text-violet bg-violet/10 px-1.5 py-0.5 rounded shrink-0">
                  {rec.tool_type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ivory">{rec.tool_name}</div>
                  {rec.description && (
                    <div className="text-xs text-silver/60 mt-0.5">
                      {rec.description}
                    </div>
                  )}
                </div>
                {rec.tool_url && (
                  <a
                    href={rec.tool_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet font-mono shrink-0"
                  >
                    Open
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review progress bar */}
      {stats.totalCards > 0 && (
        <div className="rounded-xl border border-steel bg-obsidian p-5">
          <div className="text-[10px] tracking-[1.5px] uppercase text-silver/60 font-mono mb-3.5">
            Review Progress
          </div>
          <SrsBar
            stages={stats.byStage.map((s) => ({
              stage: s.stage,
              count: s.count,
            }))}
            total={stats.totalCards}
          />
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
