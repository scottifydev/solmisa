import type { Metadata } from "next";
import { getReviewQueue, hasAnyCards } from "@/lib/actions/review";
import { ReviewSession } from "@/components/review/review-session";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage() {
  const queue = await getReviewQueue();

  if (queue.items.length === 0) {
    const hasCards = await hasAnyCards();

    return (
      <div className="max-w-lg mx-auto p-6">
        {hasCards ? (
          <EmptyState
            title="All caught up"
            message="No cards are due right now. Your next review will appear when items are ready."
          />
        ) : (
          <EmptyState
            title="Your review queue is empty"
            message="Complete a lesson to add your first review items."
            action={{ label: "Start a lesson", href: "/learn" }}
          />
        )}
        <div className="mt-4 text-center">
          <Link
            href="/learn"
            className="text-violet text-sm hover:text-violet/80 transition-colors"
          >
            &larr; Back to learning
          </Link>
        </div>
      </div>
    );
  }

  return <ReviewSession initialQueue={queue} />;
}
