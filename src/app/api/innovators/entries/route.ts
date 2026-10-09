import { NextResponse } from "next/server";
import {
  entryCreatedAtMs,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  toPublicEventEntry,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Gallery is temporarily unavailable." }, { status: 503 });
    }

    const snap = await adminDb
      .collection(LAF_EVENT_SUBMISSIONS_COLLECTION)
      .where("eventSlug", "==", YOUNG_INNOVATORS_2026_EVENT_SLUG)
      .where("status", "==", "approved")
      .get();

    const entries = snap.docs
      .map((doc) => toPublicEventEntry(doc.id, doc.data() as Record<string, unknown>))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.voteCount - a.voteCount || entryCreatedAtMs(b) - entryCreatedAtMs(a));

    return NextResponse.json(
      { entries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error("[innovators/entries]", err);
    return NextResponse.json({ error: "Could not load entries." }, { status: 500 });
  }
}
