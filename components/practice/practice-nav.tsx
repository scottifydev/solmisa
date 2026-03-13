"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/practice/notes", label: "Notes" },
  { href: "/practice/keys", label: "Keys" },
  { href: "/practice/scales", label: "Scales" },
  { href: "/practice/circle", label: "Circle" },
];

export function PracticeNav() {
  const pathname = usePathname();
  const isRoot = pathname === "/practice";

  return (
    <nav className="sticky top-0 z-40 bg-night/95 backdrop-blur border-b border-steel/50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-1 py-3">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-ash hover:text-silver transition-colors shrink-0"
            aria-label="Back to app"
          >
            ←
          </Link>
          <span className="text-steel text-xs mx-1">/</span>
          <Link
            href="/practice"
            className="text-xs font-mono text-ash hover:text-silver transition-colors mr-2 shrink-0"
          >
            Practice
          </Link>
          {!isRoot && (
            <>
              <span className="text-steel text-xs">/</span>
              <div className="flex items-center gap-1 ml-1 flex-1 min-w-0 overflow-x-auto scrollbar-none">
                {TABS.map((tab) => {
                  const isActive =
                    pathname === tab.href ||
                    pathname.startsWith(tab.href + "/");
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all ${
                        isActive
                          ? "bg-violet/10 border border-violet text-violet"
                          : "border border-steel text-silver hover:border-silver/40"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
