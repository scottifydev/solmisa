"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Something went wrong
        </h1>
        <p className="text-silver">
          An unexpected error occurred. Try refreshing the page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
