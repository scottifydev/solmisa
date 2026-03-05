"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Create an account
        </h1>
        <p className="text-silver text-sm mt-1">
          Start your ear training journey
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-silver mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-violet/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-silver mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-violet/50"
            placeholder="At least 6 characters"
          />
        </div>

        {error && <div className="text-incorrect text-sm">{error}</div>}

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-silver">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-violet hover:text-violet/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
