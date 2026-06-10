import { NextResponse } from "next/server";
import { syncGoogleReviewsToFirestore } from "@/lib/google-reviews-sync";

export const maxDuration = 60;

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const isCron = Boolean(cronSecret && auth === `Bearer ${cronSecret}`);

  if (!isCron) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await syncGoogleReviewsToFirestore();
    if (result.error && result.synced === 0) {
      return NextResponse.json(result, { status: 503 });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Review sync failed." }, { status: 500 });
  }
}
