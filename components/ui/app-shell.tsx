import type { ReactNode } from "react";
import { NavBar } from "./nav-bar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-night">
      <NavBar />
      <main className="pb-20 sm:pb-0 sm:pt-16">
        {children}
      </main>
    </div>
  );
}
