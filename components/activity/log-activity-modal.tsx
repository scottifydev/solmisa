"use client";

import { useState } from "react";
import { logActivity } from "@/lib/actions/activity";
import { ACTIVITY_TYPES } from "@/lib/activity-types";
import { Button } from "@/components/ui/button";

interface LogActivityModalProps {
  open: boolean;
  onClose: () => void;
}

export function LogActivityModal({ open, onClose }: LogActivityModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const typeConfig = ACTIVITY_TYPES.find((t) => t.key === selectedType);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      await logActivity(
        selectedType,
        duration ? parseInt(duration, 10) : null,
        notes || null,
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedType(null);
        setDuration("");
        setNotes("");
        onClose();
      }, 800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-activity-title"
    >
      <div
        className="absolute inset-0 bg-night/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-obsidian border border-steel rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2
            id="log-activity-title"
            className="font-display text-lg font-bold text-ivory"
          >
            Log activity
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-silver/40 hover:text-silver text-xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">&#x2705;</div>
            <p className="text-ivory font-body">
              Logged. Your radar is updating.
            </p>
          </div>
        ) : (
          <>
            {/* Activity type grid */}
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    selectedType === type.key
                      ? "border-violet bg-violet/10"
                      : "border-steel bg-slate hover:border-silver"
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-[11px] text-silver leading-tight">
                    {type.label}
                  </div>
                </button>
              ))}
            </div>

            {selectedType && (
              <>
                {/* Duration */}
                <div>
                  <label
                    htmlFor="activity-duration"
                    className="text-[10px] tracking-[1.5px] uppercase text-ash font-mono block mb-1.5"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    id="activity-duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={`${typeConfig?.defaultDuration ?? 30}`}
                    className="w-full rounded-lg border border-steel bg-night px-3 py-2 text-ivory text-sm placeholder:text-silver/30 focus:outline-none focus:ring-2 focus:ring-violet/50"
                    min={1}
                    max={480}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="activity-notes"
                    className="text-[10px] tracking-[1.5px] uppercase text-ash font-mono block mb-1.5"
                  >
                    Notes (optional)
                  </label>
                  <input
                    id="activity-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you work on?"
                    maxLength={500}
                    className="w-full rounded-lg border border-steel bg-night px-3 py-2 text-ivory text-sm placeholder:text-silver/30 focus:outline-none focus:ring-2 focus:ring-violet/50"
                  />
                </div>

                <Button fullWidth loading={submitting} onClick={handleSubmit}>
                  Log {typeConfig?.label}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
