"use server";

import { createClient } from "@/lib/supabase/server";
import { AXIS_DB_TO_DISPLAY } from "@/lib/skill-axes";

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

  const previousWeights: Record<string, number> =
    existing ? (options[existing.selected_option]?.weights ?? {}) : {};

  // Upsert the response
  await supabase.from("assessment_responses").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      selected_option: selectedOption,
    },
    { onConflict: "user_id,question_id" },
  );

  // Calculate weight deltas (new weights minus old weights)
  const allAxes = new Set([
    ...Object.keys(selected.weights),
    ...Object.keys(previousWeights),
  ]);

  for (const axis of allAxes) {
    const newWeight = selected.weights[axis] ?? 0;
    const oldWeight = previousWeights[axis] ?? 0;
    const delta = newWeight - oldWeight;

    if (delta === 0) continue;

    // Get display name for lookup
    const displayName = AXIS_DB_TO_DISPLAY[axis] ?? axis;
    void displayName; // used for validation only

    // Check if skill axis row exists
    const { data: axisRow } = await supabase
      .from("skill_axes")
      .select("id, score")
      .eq("user_id", user.id)
      .eq("axis_name", axis)
      .eq("source", "assessment")
      .maybeSingle();

    if (axisRow) {
      await supabase
        .from("skill_axes")
        .update({ score: (axisRow.score ?? 0) + delta, updated_at: new Date().toISOString() })
        .eq("id", axisRow.id);
    } else {
      await supabase.from("skill_axes").insert({
        user_id: user.id,
        axis_name: axis,
        score: Math.max(0, delta),
        source: "assessment",
      });
    }
  }

  return { success: true };
}

export async function getAssessmentProgress(): Promise<{
  answered: number;
  total: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [{ count: total }, { count: answered }] = await Promise.all([
    supabase
      .from("assessment_questions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("assessment_responses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  return { answered: answered ?? 0, total: total ?? 0 };
}
