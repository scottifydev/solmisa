import { getDashboardStats, getProfile } from "@/lib/actions/dashboard";
import { StatCard } from "@/components/ui/stat-card";
import { SrsBadge } from "@/components/ui/srs-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { srsStageColors } from "@/lib/tokens";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, profile] = await Promise.all([
    getDashboardStats(),
    getProfile(),
  ]);

  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}`
    : "Welcome back";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-ivory">{greeting}</h1>
        <p className="text-silver mt-1">Here&apos;s your ear training overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Cards Due" value={stats.dueToday} color="#FF6B6B" />
        <StatCard label="Total Cards" value={stats.totalCards} />
        <StatCard label="Reviews Today" value={stats.reviewsToday} />
        <StatCard
          label="Streak"
          value={`${stats.streakDays}d`}
          color="#FFB347"
        />
      </div>

      {/* Review CTA */}
      {stats.dueToday > 0 && (
        <Link
          href="/review"
          className="block rounded-xl border border-coral/30 bg-coral/5 p-6 hover:bg-coral/10 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-ivory">
                {stats.dueToday} card{stats.dueToday !== 1 ? "s" : ""} ready for review
              </h2>
              <p className="text-silver text-sm mt-1">
                Keep your streak going — practice makes permanent
              </p>
            </div>
            <span className="text-coral text-2xl">→</span>
          </div>
        </Link>
      )}

      {/* SRS Stage breakdown */}
      <div className="rounded-xl border border-steel bg-charcoal p-6">
        <h2 className="font-display text-lg font-bold text-ivory mb-4">Card Mastery</h2>
        {stats.totalCards === 0 ? (
          <p className="text-silver text-sm">
            No cards yet. Complete lessons to start building your review deck.
          </p>
        ) : (
          <div className="space-y-3">
            {stats.byStage.map((group) => (
              <div key={group.stage} className="flex items-center gap-3">
                <SrsBadge stage={group.stage} size="sm" />
                <div className="flex-1">
                  <ProgressBar
                    value={group.count}
                    max={stats.totalCards}
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
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/learn"
          className="rounded-xl border border-steel bg-charcoal p-6 hover:border-silver transition-colors"
        >
          <h3 className="font-display text-lg font-bold text-ivory">Continue Learning</h3>
          <p className="text-silver text-sm mt-1">
            Pick up where you left off in the curriculum
          </p>
        </Link>
        <Link
          href="/profile"
          className="rounded-xl border border-steel bg-charcoal p-6 hover:border-silver transition-colors"
        >
          <h3 className="font-display text-lg font-bold text-ivory">Your Profile</h3>
          <p className="text-silver text-sm mt-1">
            View your stats and settings
          </p>
        </Link>
      </div>
    </div>
  );
}
