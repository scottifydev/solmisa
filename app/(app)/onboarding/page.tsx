"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

type Step = "welcome" | "name" | "instrument" | "experience";

const instruments = [
  "Voice",
  "Piano",
  "Guitar",
  "Violin",
  "Cello",
  "Flute",
  "Trumpet",
  "Drums",
  "Other",
];

const experienceLevels = [
  { value: "beginner", label: "Beginner", description: "Just starting out with music" },
  { value: "intermediate", label: "Intermediate", description: "Some musical training or experience" },
  { value: "advanced", label: "Advanced", description: "Years of formal training or practice" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState("");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced" | "">("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any).update({
      display_name: name || null,
      instrument: instrument || null,
      experience_level: experience || null,
      onboarding_completed: true,
    }).eq("id", user.id);

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {(["welcome", "name", "instrument", "experience"] as Step[]).map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-coral" : "bg-steel"
              }`}
            />
          ))}
        </div>

        {step === "welcome" && (
          <div className="text-center space-y-6">
            <Logo size={64} glow />
            <div>
              <h1 className="font-display text-3xl font-bold text-ivory">Welcome to Solmisa</h1>
              <p className="text-silver mt-2">
                Train your ear using Gordon&apos;s Music Learning Theory.
                Let&apos;s set up your profile.
              </p>
            </div>
            <Button fullWidth onClick={() => setStep("name")}>
              Get started
            </Button>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">What should we call you?</h2>
              <p className="text-silver text-sm mt-1">This will be shown on your profile</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-steel bg-charcoal px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-coral/50"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("welcome")}>Back</Button>
              <Button fullWidth onClick={() => setStep("instrument")}>Continue</Button>
            </div>
          </div>
        )}

        {step === "instrument" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">Your instrument</h2>
              <p className="text-silver text-sm mt-1">What do you primarily play or sing?</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {instruments.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className={`
                    rounded-lg border p-3 text-sm font-body transition-colors
                    ${instrument === inst
                      ? "border-coral bg-coral/10 text-ivory"
                      : "border-steel bg-charcoal text-silver hover:border-silver"
                    }
                  `}
                >
                  {inst}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("name")}>Back</Button>
              <Button fullWidth onClick={() => setStep("experience")}>Continue</Button>
            </div>
          </div>
        )}

        {step === "experience" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-ivory">Experience level</h2>
              <p className="text-silver text-sm mt-1">This helps us personalize your learning path</p>
            </div>
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setExperience(level.value)}
                  className={`
                    w-full rounded-lg border p-4 text-left transition-colors
                    ${experience === level.value
                      ? "border-coral bg-coral/10"
                      : "border-steel bg-charcoal hover:border-silver"
                    }
                  `}
                >
                  <div className="text-ivory font-medium">{level.label}</div>
                  <div className="text-silver text-sm">{level.description}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep("instrument")}>Back</Button>
              <Button fullWidth loading={loading} onClick={handleComplete}>
                Start learning
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
