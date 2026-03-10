"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

interface Tab {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.JSX.Element;
  badge?: number;
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

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
      <path
        d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.17 12.5a1.39 1.39 0 0 0 .28 1.53l.05.05a1.69 1.69 0 1 1-2.39 2.39l-.05-.05a1.39 1.39 0 0 0-1.53-.28 1.39 1.39 0 0 0-.84 1.27v.14a1.69 1.69 0 1 1-3.38 0v-.07A1.39 1.39 0 0 0 7.4 16.2a1.39 1.39 0 0 0-1.53.28l-.05.05a1.69 1.69 0 1 1-2.39-2.39l.05-.05a1.39 1.39 0 0 0 .28-1.53 1.39 1.39 0 0 0-1.27-.84h-.14a1.69 1.69 0 0 1 0-3.38h.07A1.39 1.39 0 0 0 3.8 7.4a1.39 1.39 0 0 0-.28-1.53l-.05-.05a1.69 1.69 0 1 1 2.39-2.39l.05.05a1.39 1.39 0 0 0 1.53.28h.07a1.39 1.39 0 0 0 .84-1.27v-.14a1.69 1.69 0 0 1 3.38 0v.07a1.39 1.39 0 0 0 .84 1.27 1.39 1.39 0 0 0 1.53-.28l.05-.05a1.69 1.69 0 1 1 2.39 2.39l-.05.05a1.39 1.39 0 0 0-.28 1.53v.07a1.39 1.39 0 0 0 1.27.84h.14a1.69 1.69 0 0 1 0 3.38h-.07a1.39 1.39 0 0 0-1.27.84Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/learn")
    return pathname === "/learn" || pathname.startsWith("/learn/");
  if (href === "/flow")
    return pathname === "/flow" || pathname.startsWith("/flow/");
  if (href === "/practice")
    return pathname === "/practice" || pathname.startsWith("/practice/");
  if (href === "/profile")
    return pathname === "/profile" || pathname.startsWith("/profile/");
  if (href === "/settings")
    return pathname === "/settings" || pathname.startsWith("/settings/");
  return pathname.startsWith(href);
}

function FlowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M3 10c2-4 5-4 7 0s5 4 7 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3 14c2-4 5-4 7 0s5 4 7 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

interface NavBarProps {
  streak?: number;
  reviewCount?: number;
  newLessonCount?: number;
  flowDueCount?: number;
}

export function NavBar({
  streak = 0,
  reviewCount = 0,
  newLessonCount = 0,
  flowDueCount = 0,
}: NavBarProps) {
  const pathname = usePathname();
  const hasActiveStreak = streak > 0;

  const tabs: Tab[] = [
    {
      href: "/learn",
      label: "Learn",
      icon: BookIcon,
      badge: newLessonCount > 0 ? newLessonCount : undefined,
    },
    {
      href: "/flow",
      label: "Flow",
      icon: FlowIcon,
      badge: flowDueCount > 0 ? flowDueCount : undefined,
    },
    { href: "/practice", label: "Practice", icon: TargetIcon },
    {
      href: "/review",
      label: "Review",
      icon: RefreshIcon,
      badge: reviewCount > 0 ? reviewCount : undefined,
    },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        aria-label="Main navigation"
        className="hidden sm:flex fixed top-0 left-0 bottom-0 z-40 w-[200px] flex-col border-r border-steel bg-night/80 backdrop-blur-xl"
      >
        <div className="flex items-center h-14 px-5 border-b border-steel shrink-0">
          <Link href="/profile">
            <Logo size={28} withWordmark wordmarkSize="md" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-3 py-4">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body transition-colors
                  ${active ? "bg-violet/10 text-violet font-semibold" : "text-silver hover:text-ivory hover:bg-steel/20"}
                `}
              >
                <Icon className="shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-auto bg-incorrect text-white font-mono text-[10px] rounded-full px-1.5 min-w-[18px] text-center leading-[18px]">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-auto pt-2">
            <Link
              href="/settings"
              className={`
                relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-body transition-colors
                ${isTabActive(pathname, "/settings") ? "bg-violet/10 text-violet font-semibold" : "text-silver hover:text-ivory hover:bg-steel/20"}
              `}
            >
              <GearIcon className="shrink-0" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-steel">
          <span
            className={`font-mono text-sm ${hasActiveStreak ? "text-warning" : "text-silver"}`}
            aria-label={
              hasActiveStreak ? `Streak: ${streak} days` : "No active streak"
            }
          >
            {hasActiveStreak ? (
              <>
                <span aria-hidden="true">🔥</span> {streak}d streak
              </>
            ) : (
              <span aria-hidden="true" title="Silence before the music starts">
                𝄻
              </span>
            )}
          </span>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="flex sm:hidden fixed top-0 left-0 right-0 z-40 h-12 items-center justify-between px-4 border-b border-steel bg-night/80 backdrop-blur-xl">
        <Link href="/profile" className="shrink-0">
          <Logo size={24} />
        </Link>

        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-sm ${hasActiveStreak ? "text-warning" : "text-silver"}`}
            aria-label={
              hasActiveStreak ? `Streak: ${streak} days` : "No active streak"
            }
          >
            {hasActiveStreak ? (
              <>
                <span aria-hidden="true">🔥</span> {streak}
              </>
            ) : (
              <span aria-hidden="true" title="Silence before the music starts">
                𝄻
              </span>
            )}
          </span>
          <Link
            href="/settings"
            className={`p-1 rounded-md transition-colors ${isTabActive(pathname, "/settings") ? "text-violet" : "text-silver hover:text-ivory"}`}
            aria-label="Settings"
          >
            <GearIcon />
          </Link>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Main navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-night border-t border-steel"
        style={{
          height: "calc(64px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 text-xs font-body
                ${active ? "text-violet" : "text-ash"}
              `}
            >
              <Icon aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-1 right-0.5 bg-incorrect text-white font-mono text-[10px] rounded-full px-1 min-w-[16px] text-center leading-4">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
