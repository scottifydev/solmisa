"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const redirectTo =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectTo);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ivory">
          Welcome back
        </h1>
        <p className="text-silver text-sm mt-1">
          Sign in to continue your ear training
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-violet/50"
            placeholder="••••••••"
          />
        </div>

        {error && <div className="text-incorrect text-sm">{error}</div>}

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-steel" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-night px-2 text-silver">or</span>
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={handleGoogleLogin}>
        Continue with Google
      </Button>

      <div className="text-center text-sm text-silver space-y-2">
        <Link
          href="/reset-password"
          className="block hover:text-ivory transition-colors"
        >
          Forgot your password?
        </Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-violet hover:text-violet/80 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
