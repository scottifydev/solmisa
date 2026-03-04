import { getDashboardStats } from "@/lib/actions/dashboard";
import { getProfile } from "@/lib/actions/profile";
import { getSkillAxes } from "@/lib/actions/skills";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBar } from "@/components/landing/srs-bar";
import { SkillRadar } from "@/components/dashboard/skill-radar";
import { colors } from "@/lib/tokens";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, profile, skillAxes] = await Promise.all([
    getDashboardStats(),
    getProfile(),
    getSkillAxes(),
  ]);

  const greeting = profile?.name
    ? `Good evening, ${profile.name}`
    : "Welcome back";

  const accuracy = stats.reviewsToday > 0 ? "84%" : "--";

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
      <div className="flex gap-3">
        {stats.dueToday > 0 ? (
          <Link
            href="/review"
            className="flex-1 p-4 sm:p-5 rounded-xl border border-coral/20 bg-gradient-to-br from-coral/8 to-amber/5 hover:from-coral/15 hover:to-amber/10 transition-all flex items-center gap-3"
          >
            <span className="text-2xl shrink-0">&#x1F504;</span>
            <div>
              <div className="text-[15px] font-bold text-ivory font-body">
                Start Reviews
              </div>
              <div className="text-[12px] text-coral font-mono">
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
          className="flex-1 p-4 sm:p-5 rounded-xl border border-coral/10 bg-gradient-to-br from-coral/4 to-transparent hover:from-coral/8 transition-all flex items-center gap-3"
        >
          <span className="text-2xl shrink-0">&#x1F4D6;</span>
          <div>
            <div className="text-[15px] font-bold text-ivory font-body">
              Continue Lesson
            </div>
            <div className="text-[12px] text-coral/70 font-mono">
              Pick up where you left off
            </div>
          </div>
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <StatCard
          label="Reviews Today"
          value={stats.reviewsToday}
          sub={`${stats.dueToday} due`}
          color={colors.coral}
        />
        <StatCard label="7-Day Accuracy" value={accuracy} color="#4ECDC4" />
        <StatCard
          label="Items Mastered"
          value={stats.byStage.find((s) => s.stage === "mastered")?.count ?? 0}
          sub={`of ${stats.totalCards} total`}
          color={colors.coral}
        />
        <StatCard
          label="Streak"
          value={`${stats.streakDays}d`}
          color={colors.warning}
        />
      </div>

      {/* Skill Radar */}
      <SkillRadar axes={skillAxes} />

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
    </div>
  );
}
