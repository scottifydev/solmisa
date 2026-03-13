import Link from "next/link";

const CATEGORIES = [
  {
    href: "/practice/notes",
    label: "Notes",
    sub: "Read & play",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
    sub: "Signatures",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
    sub: "Build & alter",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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
    label: "Circle",
    sub: "of Fifths",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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

export default function PracticeLandingPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Practice Drills
        </h1>
        <p className="text-silver text-sm mt-1">
          Standalone tools. No account required.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.href} href={cat.href}>
            <div className="bg-obsidian border border-steel rounded-2xl p-6 flex flex-col items-start gap-3 hover:border-violet/40 transition-colors cursor-pointer">
              <div className="text-violet">{cat.icon}</div>
              <div>
                <div className="font-display text-base font-semibold text-ivory">
                  {cat.label}
                </div>
                <div className="text-xs text-ash font-body mt-0.5">
                  {cat.sub}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
