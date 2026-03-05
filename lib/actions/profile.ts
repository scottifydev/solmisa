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

  const [
    { data: profile },
    { count: lessonsCompleted },
    { count: totalReviews },
    { count: totalCards },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("review_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
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

  const { error } = await supabase
    .from("profiles")
    .update({
      name: name || null,
      instrument: instrument?.trim().slice(0, 100) || null,
      experience_level: experienceLevel || null,
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
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

  const { error } = await supabase
    .from("profiles")
    .update({
      primary_solfege_system: data.primary_solfege_system,
      goals: data.goals,
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
}

export async function getReviewSessionCap(): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 20;

  const { data } = await supabase
    .from("profiles")
    .select("review_session_cap")
    .eq("id", user.id)
    .single();

  return data?.review_session_cap ?? 20;
}

export async function updateReviewSessionCap(cap: number | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (cap !== null && (cap < 10 || cap > 50)) {
    throw new Error("Cap must be between 10 and 50, or null");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ review_session_cap: cap })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
}

export async function getFeelingStatesEnabled(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from("profiles")
    .select("show_feeling_states")
    .eq("id", user.id)
    .single();

  return data?.show_feeling_states ?? true;
}

export async function updateFeelingStates(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ show_feeling_states: enabled })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
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
  const { error } = await supabase.from("profiles").delete().eq("id", user.id);
  if (error) throw new Error("Failed to delete account");
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
