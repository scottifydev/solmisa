"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-ivory">Check your email</h1>
        <p className="text-silver text-sm">
          We sent a password reset link to <strong className="text-ivory">{email}</strong>
        </p>
        <Link href="/login" className="text-coral text-sm hover:text-coral/80 transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ivory">Reset password</h1>
        <p className="text-silver text-sm mt-1">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-silver mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-coral/50"
            placeholder="you@example.com"
          />
        </div>

        {error && (
          <div className="text-incorrect text-sm">{error}</div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="text-center text-sm text-silver">
        <Link href="/login" className="text-coral hover:text-coral/80 transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
