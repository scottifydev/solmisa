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
        <EmptyState
          icon={<span className="text-5xl">&#x1F3AF;</span>}
          title="All caught up!"
          message={
            !hasCards
              ? "Complete lessons to create review cards."
              : "No cards are due right now. Check back later!"
          }
          action={{ label: "Go to lessons", href: "/learn" }}
        />
        <div className="mt-4 text-center">
          <Link
            href="/learn"
            className="text-coral text-sm hover:text-coral/80 transition-colors"
          >
            ← Back to learning
          </Link>
        </div>
      </div>
    );
  }

  return <ReviewSession initialQueue={queue} />;
}
