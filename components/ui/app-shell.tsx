import type { ReactNode } from "react";
import { NavBar } from "./nav-bar";

interface AppShellProps {
  children: ReactNode;
  streak?: number;
  reviewCount?: number;
}

export function AppShell({ children, streak, reviewCount }: AppShellProps) {
  return (
    <div className="min-h-screen bg-night text-ivory font-body">
      <NavBar streak={streak} reviewCount={reviewCount} />
      <main className="pt-12 pb-[calc(64px+env(safe-area-inset-bottom))] sm:pt-14 sm:pb-0">
        {children}
      </main>
    </div>
  );
}
