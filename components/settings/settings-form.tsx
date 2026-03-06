"use client";

import {
  useState,
  useTransition,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import {
  updateProfile,
  updateLearningPreferences,
  updateReviewSessionCap,
  updateFeelingStates,
  updateAccessibilityPreferences,
  type AccessibilityPreferences,
  updateGuidedMode,
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
  accessibilityPreferences?: AccessibilityPreferences;
  guidedMode?: boolean;
}

export function SettingsForm({
  profile,
  email,
  reviewSessionCap,
  feelingStatesEnabled = true,
  accessibilityPreferences = {},
  guidedMode = false,
}: SettingsFormProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const profileRef = useRef<{ save: () => Promise<void> }>(null);
  const learningRef = useRef<{ save: () => Promise<void> }>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveAll = useCallback(() => {
    startTransition(async () => {
      await Promise.all([
        profileRef.current?.save(),
        learningRef.current?.save(),
      ]);
      showToast("Changes saved");
    });
  }, []);

  return (
    <div className="space-y-0">
      <ProfileSection
        name={profile.name}
        instrument={profile.instrument}
        experienceLevel={profile.experience_level}
        ref={profileRef}
      />
      <LearningSection
        solfegeSystem={profile.primary_solfege_system}
        goals={profile.goals}
        ref={learningRef}
      />

      <div className="border-b border-steel pb-8 mb-8">
        <Button onClick={handleSaveAll} loading={isPending}>
          Save changes
        </Button>
      </div>

      <DisplaySection
        feelingStates={feelingStatesEnabled}
        guidedModeEnabled={guidedMode}
        onSaved={() => showToast("Display settings updated")}
      />
      <AccessibilitySection
        prefs={accessibilityPreferences}
        onSaved={() => showToast("Accessibility settings updated")}
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

interface SectionSaveHandle {
  save: () => Promise<void>;
}

const ProfileSection = forwardRef<
  SectionSaveHandle,
  {
    name: string | null;
    instrument: string | null;
    experienceLevel: string | null;
  }
>(function ProfileSection({ name, instrument, experienceLevel }, ref) {
  const [nameVal, setNameVal] = useState(name ?? "");
  const [instrumentVal, setInstrumentVal] = useState(instrument ?? "");
  const [experienceVal, setExperienceVal] = useState(experienceLevel ?? "");

  useImperativeHandle(ref, () => ({
    async save() {
      const fd = new FormData();
      fd.set("name", nameVal);
      fd.set("instrument", instrumentVal);
      fd.set("experience_level", experienceVal);
      await updateProfile(fd);
    },
  }));

  return (
    <Section title="Profile">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
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
            value={instrumentVal}
            onChange={(e) => setInstrumentVal(e.target.value)}
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
            value={experienceVal}
            onChange={(e) => setExperienceVal(e.target.value)}
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
      </div>
    </Section>
  );
});

// ─── Learning Preferences Section ───────────────────────────

const LearningSection = forwardRef<
  SectionSaveHandle,
  {
    solfegeSystem: string | null;
    goals: string[] | null;
  }
>(function LearningSection({ solfegeSystem, goals }, ref) {
  const [system, setSystem] = useState(solfegeSystem ?? "numbers");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(goals ?? []);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  useImperativeHandle(ref, () => ({
    async save() {
      await updateLearningPreferences({
        primary_solfege_system: system,
        goals: selectedGoals,
      });
    },
  }));

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
      </div>
    </Section>
  );
});

// ─── Display Section ────────────────────────────────────────

function DisplaySection({
  feelingStates,
  guidedModeEnabled,
  onSaved,
}: {
  feelingStates: boolean;
  guidedModeEnabled: boolean;
  onSaved: () => void;
}) {
  const [enabled, setEnabled] = useState(feelingStates);
  const [guided, setGuided] = useState(guidedModeEnabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      await updateFeelingStates(next);
      onSaved();
    });
  };

  const handleGuidedToggle = () => {
    const next = !guided;
    setGuided(next);
    startTransition(async () => {
      await updateGuidedMode(next);
      onSaved();
    });
  };

  return (
    <Section title="Display">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-ivory">
              Show feeling descriptions
            </span>
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

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-ivory">Guided mode</span>
            <p className="text-xs text-ash mt-0.5">
              Simplified interface — one lesson at a time, focused practice only
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={guided}
            onClick={handleGuidedToggle}
            disabled={isPending}
            className={`
              relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors
              ${guided ? "bg-violet" : "bg-steel"}
              ${isPending ? "opacity-50" : ""}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform
                ${guided ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </div>
      </div>
    </Section>
  );
}

// ─── Accessibility Section ──────────────────────────────────

const TOLERANCE_OPTIONS = [
  { value: 60, label: "Tight (60ms)" },
  { value: 80, label: "Default (80ms)" },
  { value: 100, label: "Relaxed (100ms)" },
  { value: 150, label: "Wide (150ms)" },
  { value: 200, label: "Very wide (200ms)" },
] as const;

function AccessibilitySection({
  prefs,
  onSaved,
}: {
  prefs: AccessibilityPreferences;
  onSaved: () => void;
}) {
  const [highContrast, setHighContrast] = useState(
    prefs.high_contrast ?? false,
  );
  const [tolerance, setTolerance] = useState(prefs.rhythm_tolerance_ms ?? 80);
  const [isPending, startTransition] = useTransition();

  const handleToggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    startTransition(async () => {
      await updateAccessibilityPreferences({
        ...prefs,
        high_contrast: next,
        rhythm_tolerance_ms: tolerance,
      });
      onSaved();
    });
  };

  const handleSaveTolerance = () => {
    startTransition(async () => {
      await updateAccessibilityPreferences({
        ...prefs,
        high_contrast: highContrast,
        rhythm_tolerance_ms: tolerance,
      });
      onSaved();
    });
  };

  return (
    <Section title="Accessibility">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-ivory">High contrast mode</span>
            <p className="text-xs text-ash mt-0.5">
              Increases contrast for all UI elements
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={highContrast}
            onClick={handleToggleContrast}
            disabled={isPending}
            className={`
              relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors
              ${highContrast ? "bg-violet" : "bg-steel"}
              ${isPending ? "opacity-50" : ""}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform
                ${highContrast ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </div>

        <div>
          <label className={labelClass}>Rhythm tap tolerance</label>
          <p className="text-xs text-ash mb-2">
            How close your taps need to be to count as correct
          </p>
          <div className="flex flex-wrap gap-2">
            {TOLERANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTolerance(opt.value)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-mono transition-colors
                  ${
                    tolerance === opt.value
                      ? "bg-violet text-white"
                      : "bg-obsidian border border-steel text-silver hover:text-ivory"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSaveTolerance} loading={isPending}>
          Save accessibility settings
        </Button>
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

function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const [typed, setTyped] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-obsidian border border-steel rounded-xl p-6 max-w-md w-full mx-4 space-y-4 shadow-2xl">
        <h3 className="font-display text-lg text-incorrect">Delete account</h3>
        <p className="text-sm text-silver leading-relaxed">
          This will permanently delete your account and all associated data.
          This action cannot be undone.
        </p>
        <div>
          <label
            htmlFor="delete-confirm"
            className="block text-sm text-silver mb-1.5"
          >
            Type <span className="font-mono text-ivory">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm"
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            className="w-full bg-night border border-steel text-ivory rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-incorrect/50 placeholder:text-silver/30 font-mono"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="incorrect"
            onClick={onConfirm}
            loading={loading}
            disabled={typed !== "DELETE"}
          >
            Delete my account
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function AccountSection({
  email,
  onPasswordReset,
}: {
  email: string;
  onPasswordReset: () => void;
}) {
  const [isPendingPw, startPwTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

          <Button
            variant="ghost"
            className="text-incorrect hover:text-incorrect"
            fullWidth
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isPendingDelete}
      />
    </Section>
  );
}
