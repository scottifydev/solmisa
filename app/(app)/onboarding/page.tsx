"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { OnboardingAssessment } from "@/components/assessment/onboarding-assessment";
import { getOnboardingQuestions } from "@/lib/actions/assessment";
import type { AssessmentQuestion } from "@/lib/actions/assessment";

const TOTAL_STEPS = 9;

const instruments = [
  "Piano",
  "Guitar",
  "Voice",
  "Bass",
  "Drums",
  "Violin",
  "Wind",
  "Strings",
  "Other",
];

const experienceLevels = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Just starting out with music",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Some musical training or experience",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Years of formal training or practice",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Music is your career or serious pursuit",
  },
] as const;

const backgroundOptions = [
  { value: "none", label: "I've never studied music formally" },
  { value: "childhood", label: "I took lessons or classes as a kid" },
  { value: "literate", label: "I can read music / played in school ensembles" },
  { value: "advanced", label: "I have a degree or significant training" },
] as const;

const goalOptions = [
  "Improve my ear",
  "Learn music theory",
  "Get better at sight reading",
  "Compose music",
  "Play with others",
  "Improvise",
  "Just explore",
];

const solfegeOptions = [
  {
    value: "numbers",
    label: "Scale degree numbers (1, 2, 3...)",
    description:
      "Quick to learn, familiar notation. Best if you think analytically.",
    demo: ["1", "3", "5"],
  },
  {
    value: "moveable_do",
    label: "Movable-do solfege (Do, Re, Mi...)",
    description:
      "Easier to sing, vowels encode tendency. The traditional method.",
    demo: ["Do", "Mi", "Sol"],
  },
] as const;

type ExperienceLevel = (typeof experienceLevels)[number]["value"];
type Background = (typeof backgroundOptions)[number]["value"];
type SolfegeSystem = (typeof solfegeOptions)[number]["value"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel | "">("");
  const [background, setBackground] = useState<Background | "">("");
  const [goals, setGoals] = useState<string[]>([]);
  const [solfege, setSolfege] = useState<SolfegeSystem>("moveable_do");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assessmentQuestions, setAssessmentQuestions] = useState<
    AssessmentQuestion[]
  >([]);

  useEffect(() => {
    if (step === 7 && assessmentQuestions.length === 0) {
      getOnboardingQuestions()
        .then(setAssessmentQuestions)
        .catch(() => {});
    }
  }, [step, assessmentQuestions.length]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const playDemoArpeggio = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const freqs = [261.63, 329.63, 392.0]; // C4, E4, G4
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.4);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + i * 0.4 + 0.35,
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.4);
        osc.stop(ctx.currentTime + i * 0.4 + 0.4);
      });
    } catch {
      // Audio not available
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: name || null,
          instrument: instrument || null,
          experience_level: experience || null,
          musical_background: background || null,
          goals: goals.length > 0 ? goals : null,
          primary_solfege_system: solfege,
          onboarding_complete: true,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= step ? "bg-coral" : "bg-steel"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Logo size={64} layout="stacked" glow />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-ivory">
                Let&apos;s set up your profile
              </h1>
            </div>
            <Button fullWidth onClick={next}>
              Get started
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                What should we call you?
              </h2>
              <p className="text-silver text-sm mt-1">
                This will be shown on your profile
              </p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-coral/50"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                Your instrument
              </h2>
              <p className="text-silver text-sm mt-1">
                What do you primarily play or sing?
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {instruments.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className={`rounded-lg border p-3 text-sm font-body transition-colors ${
                    instrument === inst
                      ? "border-coral bg-coral/10 text-ivory"
                      : "border-steel bg-obsidian text-silver hover:border-silver"
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                Experience level
              </h2>
              <p className="text-silver text-sm mt-1">
                This helps us personalize your learning path
              </p>
            </div>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperience(level.value)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    experience === level.value
                      ? "border-coral bg-coral/10"
                      : "border-steel bg-obsidian hover:border-silver"
                  }`}
                >
                  <div className="text-ivory font-medium">{level.label}</div>
                  <div className="text-silver text-sm">{level.description}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                Musical background
              </h2>
              <p className="text-silver text-sm mt-1">
                Tell us about your music education
              </p>
            </div>
            <div className="space-y-3">
              {backgroundOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setBackground(opt.value)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    background === opt.value
                      ? "border-coral bg-coral/10"
                      : "border-steel bg-obsidian hover:border-silver"
                  }`}
                >
                  <div className="text-ivory text-sm">{opt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                What are your goals?
              </h2>
              <p className="text-silver text-sm mt-1">Select all that apply</p>
            </div>
            <div className="space-y-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                    goals.includes(goal)
                      ? "border-coral bg-coral/10 text-ivory"
                      : "border-steel bg-obsidian text-silver hover:border-silver"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">
                Solfege preference
              </h2>
              <p className="text-silver text-sm mt-1">
                How would you like to label scale degrees? You can change this
                later.
              </p>
            </div>

            <button
              type="button"
              onClick={playDemoArpeggio}
              className="w-full rounded-lg border border-steel bg-obsidian p-3 text-center text-sm text-silver hover:border-silver transition-colors"
            >
              <span className="mr-2">&#x1F50A;</span> Listen to C &ndash; E
              &ndash; G
            </button>

            <div className="space-y-3">
              {solfegeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSolfege(opt.value)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    solfege === opt.value
                      ? "border-coral bg-coral/10"
                      : "border-steel bg-obsidian hover:border-silver"
                  }`}
                >
                  <div className="text-ivory font-medium text-sm">
                    {opt.label}
                  </div>
                  <div className="text-silver text-xs mt-1">
                    {opt.description}
                  </div>
                  <div className="text-coral/70 text-xs mt-1 font-mono">
                    {opt.demo.join(" \u2013 ")}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth onClick={next}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 7 &&
          (assessmentQuestions.length > 0 ? (
            <OnboardingAssessment
              questions={assessmentQuestions}
              onComplete={next}
              onBack={back}
            />
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-ivory">
                  Loading assessment...
                </h2>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={back}>
                  Back
                </Button>
                <Button fullWidth onClick={next}>
                  Skip
                </Button>
              </div>
            </div>
          ))}

        {step === 8 && (
          <div className="text-center space-y-6">
            <h2 className="font-display text-2xl font-bold text-ivory">
              You&apos;re ready to start hearing music differently.
            </h2>
            {error && <p className="text-incorrect text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button fullWidth loading={loading} onClick={handleComplete}>
                Go to dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
