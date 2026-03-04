"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getProfile();

  const [
    { count: lessonsCompleted },
    { count: totalReviews },
    { count: totalCards },
  ] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("review_records")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("user_card_state")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const name = (formData.get("name") as string)?.trim().slice(0, 100);
  const instrument = formData.get("instrument") as string;
  const experienceLevel = formData.get("experience_level") as string;

  const validLevels = ["beginner", "intermediate", "advanced", "professional"];
  if (experienceLevel && !validLevels.includes(experienceLevel)) {
    throw new Error("Invalid experience level");
  }

  await supabase
    .from("profiles")
    .update({
      name: name || null,
      instrument: instrument?.trim().slice(0, 100) || null,
      experience_level: experienceLevel || null,
    })
    .eq("id", user.id);
}

export async function updateLearningPreferences(data: {
  primary_solfege_system: string;
  goals: string[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const validSystems = ["numbers", "moveable_do"];
  if (!validSystems.includes(data.primary_solfege_system)) {
    throw new Error("Invalid solfege system");
  }

  await supabase
    .from("profiles")
    .update({
      primary_solfege_system: data.primary_solfege_system,
      goals: data.goals,
    })
    .eq("id", user.id);
}

export async function requestPasswordReset() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  await supabase.auth.resetPasswordForEmail(user.email);
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete profile (cascades to related data via FK)
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
