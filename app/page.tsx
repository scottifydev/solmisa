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

      {/* Hero section */}
      <section className="px-6 pt-16 pb-10 max-w-[960px] mx-auto text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ivory">
          Train your musical ear with research-backed methods
        </h1>
        <p className="mt-4 text-silver text-base sm:text-lg max-w-[640px] mx-auto leading-relaxed">
          Solmisa combines functional ear training, music theory, and spaced
          repetition to develop real musicianship. Hear the difference between
          scale degrees, understand why chords move the way they do, and build
          skills that stick.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-violet text-white text-sm font-body font-semibold hover:bg-violet/90 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-2.5 rounded-lg border border-steel text-silver hover:text-ivory hover:border-silver/50 transition-colors text-sm font-body"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Demo dashboard in a preview container */}
      <section className="px-6 pb-12 max-w-[1040px] mx-auto">
        <div className="rounded-2xl border border-steel/60 bg-obsidian/50 overflow-hidden">
          <div className="px-6 py-3 border-b border-steel/40 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-steel/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-steel/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-steel/60" />
            </div>
            <span className="text-[11px] text-silver/50 font-mono ml-2 tracking-wide uppercase">
              Preview your dashboard
            </span>
          </div>
          <LandingDashboard />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 max-w-[960px] mx-auto">
        <h2 className="font-display text-2xl font-bold text-ivory text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <HowItWorksStep
            number={1}
            title="Learn"
            description="Short, focused lessons introduce scale degrees, intervals, and theory concepts one at a time."
          />
          <HowItWorksStep
            number={2}
            title="Practice"
            description="Listen, identify, and respond. Each exercise builds on what you already know."
          />
          <HowItWorksStep
            number={3}
            title="Review"
            description="Spaced repetition schedules reviews right before you forget, so knowledge sticks long-term."
          />
          <HowItWorksStep
            number={4}
            title="Watch your radar grow"
            description="Track your strengths across every skill dimension. See your musicianship develop over time."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-steel/40 px-6 py-10 mt-8">
        <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <span className="text-silver/50 text-xs font-mono">
              &copy; {new Date().getFullYear()} Solmisa
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-silver/60 hover:text-ivory text-xs font-body transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-silver/60 hover:text-ivory text-xs font-body transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-silver/60 hover:text-ivory text-xs font-body transition-colors"
            >
              Terms
            </Link>
            <Link
              href="mailto:hello@solmisa.com"
              className="text-silver/60 hover:text-ivory text-xs font-body transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-violet/30 bg-violet/10 text-violet text-sm font-bold font-mono mb-3">
        {number}
      </div>
      <h3 className="font-display text-base font-bold text-ivory mb-1.5">
        {title}
      </h3>
      <p className="text-silver text-sm leading-relaxed">{description}</p>
    </div>
  );
}
