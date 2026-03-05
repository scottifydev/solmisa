"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  updateProfile,
  updateLearningPreferences,
  updateReviewSessionCap,
  updateFeelingStates,
  requestPasswordReset,
  deleteAccount,
  signOut,
} from "@/lib/actions/profile";

// ─── Shared Constants ───────────────────────────────────────

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
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

const goalOptions = [
  "Improve my ear",
  "Learn music theory",
  "Get better at sight reading",
  "Compose music",
  "Play with others",
  "Improvise",
  "Just explore",
];

// ─── Toast ──────────────────────────────────────────────────

function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-correct/90 text-night px-4 py-2 rounded-lg font-body text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-4">
      {message}
      <button
        onClick={onDismiss}
        className="ml-3 text-night/60 hover:text-night"
      >
        &times;
      </button>
    </div>
  );
}

// ─── Section Wrapper ────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-steel pb-8 mb-8 last:border-0">
      <h2 className="font-display text-lg text-ivory mb-6">{title}</h2>
      {children}
    </div>
  );
}

// ─── Input Styles ───────────────────────────────────────────

const inputClass =
  "w-full bg-obsidian border border-steel text-ivory rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet/50 placeholder:text-silver/50";
const selectClass =
  "w-full bg-obsidian border border-steel text-ivory rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet/50";
const labelClass = "block text-sm text-silver mb-1.5";

// ─── Main Form ──────────────────────────────────────────────

interface SettingsFormProps {
  profile: {
    name: string | null;
    instrument: string | null;
    experience_level: string | null;
    primary_solfege_system: string | null;
    goals: string[] | null;
  };
  email: string;
  reviewSessionCap?: number | null;
  feelingStatesEnabled?: boolean;
}

export function SettingsForm({
  profile,
  email,
  reviewSessionCap,
  feelingStatesEnabled = true,
}: SettingsFormProps) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-0">
      <ProfileSection
        name={profile.name}
        instrument={profile.instrument}
        experienceLevel={profile.experience_level}
        onSaved={() => showToast("Profile updated")}
      />
      <LearningSection
        solfegeSystem={profile.primary_solfege_system}
        goals={profile.goals}
        onSaved={() => showToast("Preferences updated")}
      />
      <DisplaySection
        feelingStates={feelingStatesEnabled}
        onSaved={() => showToast("Display settings updated")}
      />
      <ReviewSection
        sessionCap={reviewSessionCap ?? 20}
        onSaved={() => showToast("Review settings updated")}
      />
      <AccountSection
        email={email}
        onPasswordReset={() => showToast("Password reset email sent")}
      />
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ─── Profile Section ────────────────────────────────────────

function ProfileSection({
  name,
  instrument,
  experienceLevel,
  onSaved,
}: {
  name: string | null;
  instrument: string | null;
  experienceLevel: string | null;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateProfile(formData);
      onSaved();
    });
  };

  return (
    <Section title="Profile">
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={name ?? ""}
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="instrument" className={labelClass}>
            Primary instrument
          </label>
          <select
            id="instrument"
            name="instrument"
            defaultValue={instrument ?? ""}
            className={selectClass}
          >
            <option value="">Select...</option>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experience_level" className={labelClass}>
            Experience level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            defaultValue={experienceLevel ?? ""}
            className={selectClass}
          >
            <option value="">Select...</option>
            {experienceLevels.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={isPending}>
          Save profile
        </Button>
      </form>
    </Section>
  );
}

// ─── Learning Preferences Section ───────────────────────────

function LearningSection({
  solfegeSystem,
  goals,
  onSaved,
}: {
  solfegeSystem: string | null;
  goals: string[] | null;
  onSaved: () => void;
}) {
  const [system, setSystem] = useState(solfegeSystem ?? "numbers");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(goals ?? []);
  const [isPending, startTransition] = useTransition();

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateLearningPreferences({
        primary_solfege_system: system,
        goals: selectedGoals,
      });
      onSaved();
    });
  };

  return (
    <Section title="Learning Preferences">
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Solfege system</label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => setSystem("numbers")}
              aria-pressed={system === "numbers"}
              className={`
                flex-1 py-2.5 rounded-md text-sm font-mono transition-colors
                ${
                  system === "numbers"
                    ? "bg-violet text-white"
                    : "bg-obsidian border border-steel text-silver hover:text-ivory"
                }
              `}
            >
              1, 2, 3...
            </button>
            <button
              type="button"
              onClick={() => setSystem("moveable_do")}
              aria-pressed={system === "moveable_do"}
              className={`
                flex-1 py-2.5 rounded-md text-sm font-mono transition-colors
                ${
                  system === "moveable_do"
                    ? "bg-violet text-white"
                    : "bg-obsidian border border-steel text-silver hover:text-ivory"
                }
              `}
            >
              Do, Re, Mi...
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Musical goals</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                aria-pressed={selectedGoals.includes(goal)}
                className={`
                  px-3 py-1.5 rounded-md text-sm transition-colors
                  ${
                    selectedGoals.includes(goal)
                      ? "bg-violet/20 text-violet border border-violet/40"
                      : "bg-obsidian border border-steel text-silver hover:text-ivory"
                  }
                `}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} loading={isPending}>
          Save preferences
        </Button>
      </div>
    </Section>
  );
}

// ─── Display Section ────────────────────────────────────────

function DisplaySection({
  feelingStates,
  onSaved,
}: {
  feelingStates: boolean;
  onSaved: () => void;
}) {
  const [enabled, setEnabled] = useState(feelingStates);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      await updateFeelingStates(next);
      onSaved();
    });
  };

  return (
    <Section title="Display">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-ivory">Show feeling descriptions</span>
          <p className="text-xs text-ash mt-0.5">
            Brief descriptors when tapping degrees in lessons and drills
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          disabled={isPending}
          className={`
            relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors
            ${enabled ? "bg-violet" : "bg-steel"}
            ${isPending ? "opacity-50" : ""}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform
              ${enabled ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>
      </div>
    </Section>
  );
}

// ─── Review Section ─────────────────────────────────────────

const CAP_OPTIONS = [10, 15, 20, 25, 30, 40, 50] as const;

function ReviewSection({
  sessionCap,
  onSaved,
}: {
  sessionCap: number;
  onSaved: () => void;
}) {
  const [cap, setCap] = useState(sessionCap);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await updateReviewSessionCap(cap);
      onSaved();
    });
  };

  return (
    <Section title="Review">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Max reviews per session</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {CAP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCap(opt)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-mono transition-colors
                  ${
                    cap === opt
                      ? "bg-violet text-white"
                      : "bg-obsidian border border-steel text-silver hover:text-ivory"
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="text-xs text-ash mt-2">
            When more cards are due, the most overdue will be prioritized.
          </p>
        </div>
        <Button onClick={handleSave} loading={isPending}>
          Save review settings
        </Button>
      </div>
    </Section>
  );
}

// ─── Account Section ────────────────────────────────────────

function AccountSection({
  email,
  onPasswordReset,
}: {
  email: string;
  onPasswordReset: () => void;
}) {
  const [isPendingPw, startPwTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePasswordReset = () => {
    startPwTransition(async () => {
      await requestPasswordReset();
      onPasswordReset();
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      await deleteAccount();
    });
  };

  return (
    <Section title="Account">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-night/50 border border-steel text-silver rounded-md px-4 py-3 cursor-not-allowed"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            loading={isPendingPw}
          >
            Change password
          </Button>
        </div>

        <div className="pt-4 border-t border-steel space-y-3">
          <form action={signOut}>
            <Button variant="ghost" type="submit" fullWidth>
              Sign out
            </Button>
          </form>

          {!showDeleteConfirm ? (
            <Button
              variant="ghost"
              className="text-incorrect hover:text-incorrect"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete account
            </Button>
          ) : (
            <div className="bg-incorrect/10 border border-incorrect/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-incorrect">
                This will permanently delete your account and all data. This
                cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="incorrect"
                  onClick={handleDelete}
                  loading={isPendingDelete}
                >
                  Yes, delete my account
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
