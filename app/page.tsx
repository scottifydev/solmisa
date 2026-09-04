import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Solmisa — Read a Lead Sheet",
  description:
    "Browser tools for music fundamentals, and a lab that engraves a real jazz standard, plays it back, and colors every melody note by its role in the chord underneath.",
};

const REPO_URL = "https://github.com/scottifydev/solmisa";

const FUNDAMENTALS = [
  {
    href: "/practice/notes",
    label: "Notes",
    blurb: "Name a note on the staff, or find it on the keyboard.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M10 22V8l12-3v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/practice/keys",
    label: "Keys",
    blurb: "Read a key signature, or write one from the key name.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M6 14H22M6 10H22M6 18H22M6 8V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 8V20M14 8V20M18 8V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/practice/scales",
    label: "Scales",
    blurb: "Build a scale from its name, or alter a major scale into a mode.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M4 20L8 14L12 17L16 10L20 13L24 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/practice/circle",
    label: "Circle of fifths",
    blurb: "Move between keys and see how they relate.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle
          cx="14"
          cy="14"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-night text-ivory">
      <header className="border-b border-steel/40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Logo size={26} withWordmark wordmarkSize="sm" />
          <a
            href={REPO_URL}
            className="font-mono text-xs text-ash hover:text-violet transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5">
        <section className="pt-14 pb-10">
          <h1 className="font-display font-extrabold text-ivory text-[clamp(2.6rem,9vw,4.25rem)] leading-[0.95] tracking-[-0.03em]">
            Read a lead sheet.
          </h1>
          <p className="mt-6 font-body text-silver text-base sm:text-lg leading-relaxed max-w-[54ch]">
            Four browser tools cover the fundamentals: notes, key signatures,
            scales, and the circle of fifths. The Standards Lab opens a real
            jazz standard, plays it back, and colors every melody note by its
            role in the chord underneath.
          </p>
          <p className="mt-3 font-body text-ash text-sm">
            No account. Nothing to install.
          </p>
        </section>

        <section className="pb-16">
          <Link href="/practice/standards-lab" className="group block">
            <div className="rounded-lg border border-steel overflow-hidden bg-obsidian transition-colors group-hover:border-violet/50">
              <Image
                src="/standards-lab.png"
                alt="Autumn Leaves engraved on a staff with chord symbols above each bar and melody notes colored by their role in the chord"
                width={1153}
                height={396}
                priority
                className="w-full h-auto block"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-ivory text-xl group-hover:text-violet-bright transition-colors">
                  Standards Lab
                </h2>
                <p className="mt-1 font-body text-silver text-sm max-w-[58ch]">
                  Pick a standard. It is parsed, engraved, and played back in
                  the browser, with the chord chart and a piano keyboard
                  tracking the music as it goes.
                </p>
              </div>
              <span className="font-mono text-xs text-violet shrink-0">
                Open
              </span>
            </div>
          </Link>
        </section>

        <section className="pb-16">
          <h2 className="font-display font-bold text-ivory text-lg">
            Start with the fundamentals
          </h2>
          <ul className="mt-5 border-t border-steel/50">
            {FUNDAMENTALS.map((tool) => (
              <li key={tool.href} className="border-b border-steel/50">
                <Link
                  href={tool.href}
                  className="group flex items-center gap-4 py-4 transition-colors"
                >
                  <span className="text-ash group-hover:text-violet transition-colors shrink-0">
                    {tool.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display font-semibold text-ivory text-base group-hover:text-violet-bright transition-colors">
                      {tool.label}
                    </span>
                    <span className="block font-body text-silver text-sm mt-0.5">
                      {tool.blurb}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="pb-16">
          <h2 className="font-display font-bold text-ivory text-lg">
            Under the hood
          </h2>
          <div className="mt-5 space-y-5 font-body text-silver text-sm leading-relaxed max-w-[62ch]">
            <p>
              The Standards Lab parses a MIDI file in the browser, splits the
              piano part into melody and accompaniment by grouping note onsets,
              matches the left hand against a template library that knows
              rootless and shell jazz voicings, and engraves the result with
              VexFlow.
            </p>
            <p>
              Keeping the playhead locked to the engraved score turned out to be
              the hard part. Dividing elapsed time by beats per minute drifts as
              soon as a file changes tempo, so bar boundaries are precomputed
              from MIDI ticks and the cursor reads the audio clock directly on
              every animation frame.
            </p>
            <p>
              Every tool shares one sampled grand piano, loaded once and
              scheduled on the Web Audio clock rather than on timers.
            </p>
          </div>
        </section>

        <footer className="border-t border-steel/40 py-8">
          <p className="font-body text-sm text-silver">
            Built with Next.js, TypeScript, Tone.js, and VexFlow.{" "}
            <a
              href={REPO_URL}
              className="text-violet hover:text-violet-bright transition-colors"
            >
              Source on GitHub
            </a>
            .
          </p>
          <p className="mt-2 font-body text-xs text-shadow">
            An ear-training trainer with spaced repetition is in development.
          </p>
        </footer>
      </main>
    </div>
  );
}
