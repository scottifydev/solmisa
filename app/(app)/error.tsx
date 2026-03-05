"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Something went wrong
        </h1>
        <p className="text-silver">
          An unexpected error occurred. Try again or return to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={reset}>
            Try again
          </Button>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
