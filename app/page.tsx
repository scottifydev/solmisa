import { Logo } from "@/components/ui/logo";
import { LandingDashboard } from "@/components/landing/landing-dashboard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-night text-ivory font-body">
      {/* Sticky header with backdrop blur */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-steel/50 bg-night/90 backdrop-blur-xl">
        <Logo size={28} withWordmark wordmarkSize="sm" />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-silver hover:text-ivory transition-colors text-sm font-body"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-4 py-1.5 rounded-lg bg-violet text-white text-sm font-body font-medium hover:bg-violet/90 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </header>

      <LandingDashboard />
    </div>
  );
}
