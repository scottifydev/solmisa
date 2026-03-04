import { NextResponse } from "next/server";
import { getReviewQueue } from "@/lib/actions/review";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 25);
    const queue = await getReviewQueue(limit);
    return NextResponse.json(queue);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
