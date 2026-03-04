"use server";

import { createClient } from "@/lib/supabase/server";
import { SKILL_AXES, MAX_SKILL_POINTS } from "@/lib/skill-axes";
import type { SkillAxis } from "@/lib/skill-axes";

export async function getSkillAxes(): Promise<SkillAxis[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: axes } = await supabase
    .from("skill_axes")
    .select("axis_name, score")
    .eq("user_id", user.id);

  const scoreMap = new Map<string, number>();
  for (const axis of axes ?? []) {
    const existing = scoreMap.get(axis.axis_name) ?? 0;
    scoreMap.set(axis.axis_name, existing + (axis.score ?? 0));
  }

  return SKILL_AXES.map((name) => {
    const score = Math.min(scoreMap.get(name) ?? 0, MAX_SKILL_POINTS);
    return {
      axis_name: name,
      score,
      max_points: MAX_SKILL_POINTS,
      percentage: Math.round((score / MAX_SKILL_POINTS) * 100),
    };
  });
}
