import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfileData, getReviewSessionCap } from "@/lib/actions/profile";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [data, sessionCap] = await Promise.all([
    getProfileData(),
    getReviewSessionCap(),
  ]);
  if (!data) redirect("/login");

  const { profile, email } = data;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="font-display text-2xl text-ivory mb-8">Settings</h1>
      <SettingsForm
        profile={{
          name: profile?.name ?? null,
          instrument: profile?.instrument ?? null,
          experience_level: profile?.experience_level ?? null,
          primary_solfege_system: profile?.primary_solfege_system ?? null,
          goals: profile?.goals ?? null,
        }}
        email={email}
        reviewSessionCap={sessionCap}
      />
    </div>
  );
}
