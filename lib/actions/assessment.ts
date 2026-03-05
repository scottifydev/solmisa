"use server";

import { createClient } from "@/lib/supabase/server";

export interface AssessmentOption {
  text: string;
  weights: Record<string, number>;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  category: string;
  options: AssessmentOption[];
  display_order: number;
  selected_option: number | null;
}

export async function getOnboardingQuestions(): Promise<AssessmentQuestion[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [{ data: questions }, { data: responses }] = await Promise.all([
    supabase
      .from("assessment_questions")
      .select("id, question_text, category, options, display_order")
      .eq("is_onboarding", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("assessment_responses")
      .select("question_id, selected_option")
      .eq("user_id", user.id),
  ]);

  const responseMap = new Map<string, number>();
  for (const r of responses ?? []) {
    responseMap.set(r.question_id, r.selected_option);
  }

  return (questions ?? []).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    category: q.category,
    options: q.options as AssessmentOption[],
    display_order: q.display_order ?? 0,
    selected_option: responseMap.get(q.id) ?? null,
  }));
}

export async function getNextTrickleQuestion(): Promise<AssessmentQuestion | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: responses } = await supabase
    .from("assessment_responses")
    .select("question_id")
    .eq("user_id", user.id);

  const answeredIds = new Set((responses ?? []).map((r) => r.question_id));

  const { data: questions } = await supabase
    .from("assessment_questions")
    .select("id, question_text, category, options, display_order")
    .eq("is_onboarding", false)
    .order("display_order", { ascending: true });

  const unanswered = (questions ?? []).find((q) => !answeredIds.has(q.id));
  if (!unanswered) return null;

  return {
    id: unanswered.id,
    question_text: unanswered.question_text,
    category: unanswered.category,
    options: unanswered.options as AssessmentOption[],
    display_order: unanswered.display_order ?? 0,
    selected_option: null,
  };
}

export async function submitAssessmentAnswer(
  questionId: string,
  selectedOption: number,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get question to read option weights
  const { data: question } = await supabase
    .from("assessment_questions")
    .select("options")
    .eq("id", questionId)
    .single();

  if (!question) throw new Error("Question not found");

  const options = question.options as AssessmentOption[];
  const selected = options[selectedOption];
  if (!selected) throw new Error("Invalid option index");

  // Check if user already answered this question (for re-answering)
  const { data: existing } = await supabase
    .from("assessment_responses")
    .select("id, selected_option")
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .maybeSingle();

  const previousWeights: Record<string, number> = existing
    ? (options[existing.selected_option]?.weights ?? {})
    : {};

  // Upsert the response
  const { error: upsertError } = await supabase
    .from("assessment_responses")
    .upsert(
      {
        user_id: user.id,
        question_id: questionId,
        selected_option: selectedOption,
      },
      { onConflict: "user_id,question_id" },
    );
  if (upsertError) throw new Error(upsertError.message);

  // Calculate weight deltas (new weights minus old weights)
  const allAxes = [
    ...new Set([
      ...Object.keys(selected.weights),
      ...Object.keys(previousWeights),
    ]),
  ];

  if (allAxes.length === 0) return { success: true };

  // Batch read: fetch all existing skill_axes rows for this user+source in one query
  const { data: existingAxes } = await supabase
    .from("skill_axes")
    .select("id, axis_name, score")
    .eq("user_id", user.id)
    .eq("source", "assessment")
    .in("axis_name", allAxes);

  const axisMap = new Map((existingAxes ?? []).map((r) => [r.axis_name, r]));

  const now = new Date().toISOString();
  const updates: PromiseLike<unknown>[] = [];

  for (const axis of allAxes) {
    const newWeight = selected.weights[axis] ?? 0;
    const oldWeight = previousWeights[axis] ?? 0;
    const delta = newWeight - oldWeight;
    if (delta === 0) continue;

    const existing_axis = axisMap.get(axis);
    if (existing_axis) {
      updates.push(
        supabase
          .from("skill_axes")
          .update({
            score: (existing_axis.score ?? 0) + delta,
            updated_at: now,
          })
          .eq("id", existing_axis.id),
      );
    } else {
      updates.push(
        supabase.from("skill_axes").insert({
          user_id: user.id,
          axis_name: axis,
          score: Math.max(0, delta),
          source: "assessment",
        }),
      );
    }
  }

  await Promise.all(updates);

  return { success: true };
}
