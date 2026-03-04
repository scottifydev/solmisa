"use client";

import type { ActivityLogEntry } from "@/lib/actions/activity";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

interface ActivityFeedProps {
  activities: ActivityLogEntry[];
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-silver text-sm">
        No activity this week. Log a practice session to get started.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity) => {
        const typeConfig = ACTIVITY_TYPES.find(
          (t) => t.key === activity.activity_type,
        );
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 py-3 border-b border-steel last:border-b-0"
          >
            <span className="text-lg shrink-0 mt-0.5">
              {typeConfig?.icon ?? "\u{1F3B6}"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-silver">
                {typeConfig?.label ?? activity.activity_type}
                {activity.duration_minutes && (
                  <span className="text-silver/50">
                    {" "}&middot; {activity.duration_minutes} min
                  </span>
                )}
              </div>
              {activity.notes && (
                <div className="text-xs text-silver/50 truncate mt-0.5">
                  {activity.notes}
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-ash shrink-0">
              {formatRelativeTime(activity.created_at)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
