import type { ReactNode } from "react";
import { NavBar } from "./nav-bar";

interface AppShellProps {
  children: ReactNode;
  streak?: number;
  reviewCount?: number;
  newLessonCount?: number;
  flowDueCount?: number;
}

export function AppShell({
  children,
  streak,
  reviewCount,
  newLessonCount,
  flowDueCount,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-night text-ivory font-body">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet focus:text-white focus:rounded"
      >
        Skip to content
      </a>
      <NavBar
        streak={streak}
        reviewCount={reviewCount}
        newLessonCount={newLessonCount}
        flowDueCount={flowDueCount}
      />
      <main
        id="main-content"
        className="pt-12 pb-[calc(64px+env(safe-area-inset-bottom))] sm:pt-14 sm:pb-0 sm:pl-[200px]"
      >
        {children}
      </main>
    </div>
  );
}
