import type { Metadata } from "next";
import { getProfileData, updateProfile, signOut } from "@/lib/actions/profile";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const data = await getProfileData();
  if (!data) redirect("/login");

  const { profile, stats, email } = data;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="font-display text-3xl font-bold text-ivory">Profile</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Lessons" value={stats.lessonsCompleted} />
        <StatCard label="Reviews" value={stats.totalReviews} />
        <StatCard label="Cards" value={stats.totalCards} />
      </div>

      {/* Profile form */}
      <form
        action={updateProfile}
        className="rounded-xl border border-steel bg-obsidian p-6 space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-ivory">Settings</h2>

        <div>
          <label className="block text-sm text-silver mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-steel bg-night/50 px-3 py-2 text-silver cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm text-silver mb-1">
            Display name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={profile?.name ?? ""}
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
        </div>

        <div>
          <label
            htmlFor="instrument"
            className="block text-sm text-silver mb-1"
          >
            Instrument
          </label>
          <input
            id="instrument"
            name="instrument"
            type="text"
            defaultValue={profile?.instrument ?? ""}
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory placeholder:text-silver/50 focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
        </div>

        <div>
          <label
            htmlFor="experience_level"
            className="block text-sm text-silver mb-1"
          >
            Experience level
          </label>
          <select
            id="experience_level"
            name="experience_level"
            defaultValue={profile?.experience_level ?? ""}
            className="w-full rounded-lg border border-steel bg-obsidian px-3 py-2 text-ivory focus:outline-none focus:ring-2 focus:ring-coral/50"
          >
            <option value="">Select...</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <Button type="submit">Save changes</Button>
      </form>

      {/* Sign out */}
      <form action={signOut}>
        <Button variant="ghost" type="submit" fullWidth>
          Sign out
        </Button>
      </form>
    </div>
  );
}
