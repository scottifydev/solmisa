import { NextResponse } from "next/server";
import { submitReview } from "@/lib/actions/review";
import type { ReviewAnswerRequest } from "@/types/srs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReviewAnswerRequest;

    if (!body.user_card_state_id || typeof body.correct !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = await submitReview(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
