"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/learn", label: "Learn", icon: "📖" },
  { href: "/review", label: "Review", icon: "🔄" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop: sticky top header */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 z-40 h-16 items-center justify-between px-6 border-b border-steel bg-night/80 backdrop-blur-md">
        <Link href="/dashboard">
          <Logo size={28} withWordmark wordmarkSize={18} />
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-body font-medium transition-colors
                  ${isActive ? "text-ivory bg-steel" : "text-silver hover:text-ivory hover:bg-steel/50"}
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile: bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 border-t border-steel bg-night/95 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 py-1 px-3 text-xs font-body
                ${isActive ? "text-coral" : "text-silver"}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
