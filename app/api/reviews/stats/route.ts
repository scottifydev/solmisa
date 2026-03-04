import { NextResponse } from "next/server";
import { getReviewStats } from "@/lib/actions/review";

export async function GET() {
  try {
    const stats = await getReviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
