import { Logo } from "@/components/ui/logo";
import { LandingDashboard } from "@/components/landing/landing-dashboard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-night">
      {/* Simple header: logo + auth links */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-steel">
        <Logo size={28} withWordmark wordmarkSize={18} />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-silver hover:text-ivory transition-colors text-sm font-body"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-coral text-white text-sm font-body font-medium hover:bg-coral/90 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </header>

      <LandingDashboard />
    </div>
  );
}
