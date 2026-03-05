import type { ReactNode } from "react";
import { NavBar } from "./nav-bar";

interface AppShellProps {
  children: ReactNode;
  streak?: number;
  reviewCount?: number;
  newLessonCount?: number;
}

export function AppShell({
  children,
  streak,
  reviewCount,
  newLessonCount,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-night text-ivory font-body">
      <NavBar
        streak={streak}
        reviewCount={reviewCount}
        newLessonCount={newLessonCount}
      />
      <main className="pt-12 pb-[calc(64px+env(safe-area-inset-bottom))] sm:pt-14 sm:pb-0 sm:pl-[200px]">
        {children}
      </main>
    </div>
  );
}
