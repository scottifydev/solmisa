"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getProfileData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get lesson completion count
  const { count: lessonsCompleted } = await supabase
    .from("user_lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get total review count
  const { count: totalReviews } = await supabase
    .from("srs_reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Get total cards
  const { count: totalCards } = await supabase
    .from("srs_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return {
    profile,
    stats: {
      lessonsCompleted: lessonsCompleted ?? 0,
      totalReviews: totalReviews ?? 0,
      totalCards: totalCards ?? 0,
    },
    email: user.email ?? "",
  };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const displayName = formData.get("display_name") as string;
  const instrument = formData.get("instrument") as string;
  const experienceLevel = formData.get("experience_level") as string;

  await supabase.from("profiles")
    .update({
      display_name: displayName || null,
      instrument: instrument || null,
      experience_level: experienceLevel || null,
    })
    .eq("id", user.id);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
