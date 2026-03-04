"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/review", label: "Review" },
] as const;

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11"
        y="2"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2"
        y="11"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11"
        y="11"
        width="7"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M3 4.5C3 3.67 3.67 3 4.5 3H8c1.1 0 2 .9 2 2v11.5l-.5-.5c-.55-.55-1.3-.5-1.5-.5H4.5c-.83 0-1.5-.67-1.5-1.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 4.5C17 3.67 16.33 3 15.5 3H12c-1.1 0-2 .9-2 2v11.5l.5-.5c.55-.55 1.3-.5 1.5-.5h3.5c.83 0 1.5-.67 1.5-1.5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M14.5 3.5A7 7 0 0 0 3 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.5 16.5A7 7 0 0 0 17 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 3.5h3v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16.5H5v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.5 2.5h3l.4 1.8a5.5 5.5 0 0 1 1.5.9l1.8-.5 1.5 2.6-1.4 1.2a5.5 5.5 0 0 1 0 1.8l1.4 1.2-1.5 2.6-1.8-.5a5.5 5.5 0 0 1-1.5.9l-.4 1.8h-3l-.4-1.8a5.5 5.5 0 0 1-1.5-.9l-1.8.5-1.5-2.6 1.4-1.2a5.5 5.5 0 0 1 0-1.8L3.3 7.3l1.5-2.6 1.8.5a5.5 5.5 0 0 1 1.5-.9l.4-1.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const mobileIcons: Record<
  string,
  (props: { className?: string }) => React.JSX.Element
> = {
  "/dashboard": GridIcon,
  "/learn": BookIcon,
  "/review": RefreshIcon,
};

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/learn")
    return pathname === "/learn" || pathname.startsWith("/learn/");
  return pathname.startsWith(href);
}

interface NavBarProps {
  streak?: number;
  reviewCount?: number;
}

export function NavBar({ streak = 3, reviewCount = 5 }: NavBarProps) {
  const pathname = usePathname();
  const hasActiveStreak = streak > 0;

  return (
    <>
      {/* Desktop header */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 z-40 h-14 items-center justify-between px-6 border-b border-steel bg-night/80 backdrop-blur-xl">
        <Link href="/dashboard" className="shrink-0">
          <Logo size={28} withWordmark wordmarkSize="md" />
        </Link>

        <nav className="inline-flex items-center bg-obsidian rounded-full p-1">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-body transition-colors
                  ${active ? "bg-graphite text-ivory font-semibold" : "text-silver hover:text-ivory"}
                `}
              >
                {tab.label}
                {tab.href === "/review" && reviewCount > 0 && (
                  <span className="bg-incorrect text-white font-mono text-xs rounded-full px-1.5 min-w-[20px] text-center leading-5">
                    {reviewCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 shrink-0">
          <span
            className={`font-mono text-sm ${hasActiveStreak ? "text-warning" : "text-silver"}`}
          >
            🔥 {streak}
          </span>
          <Link
            href="/settings"
            className="text-silver hover:text-ivory transition-colors"
          >
            <GearIcon />
          </Link>
        </div>
      </header>

      {/* Mobile header */}
      <header className="flex sm:hidden fixed top-0 left-0 right-0 z-40 h-12 items-center justify-between px-4 border-b border-steel bg-night/80 backdrop-blur-xl">
        <Link href="/dashboard" className="shrink-0">
          <Logo size={24} />
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-sm ${hasActiveStreak ? "text-warning" : "text-silver"}`}
          >
            🔥 {streak}
          </span>
          <Link
            href="/settings"
            className="text-silver hover:text-ivory transition-colors"
          >
            <GearIcon />
          </Link>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-night border-t border-steel"
        style={{
          height: "calc(64px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = mobileIcons[tab.href];
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-body
                ${active ? "text-coral" : "text-ash"}
              `}
            >
              {Icon && <Icon />}
              <span>{tab.label}</span>
              {tab.href === "/review" && reviewCount > 0 && (
                <span className="absolute top-1 right-0.5 bg-incorrect text-white font-mono text-[10px] rounded-full px-1 min-w-[16px] text-center leading-4">
                  {reviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
