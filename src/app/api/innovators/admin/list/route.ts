import { NextResponse } from "next/server";
import {
  entryCreatedAtMs,
  isEventAdmin,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  toAdminEventEntry,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";

export async function GET(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isEventAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const snap = await adminDb
      .collection(LAF_EVENT_SUBMISSIONS_COLLECTION)
      .where("eventSlug", "==", YOUNG_INNOVATORS_2026_EVENT_SLUG)
      .get();

    const entries = snap.docs
      .map((doc) => toAdminEventEntry(doc.id, doc.data() as Record<string, unknown>))
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((a, b) => entryCreatedAtMs(b) - entryCreatedAtMs(a));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[innovators/admin/list]", err);
    return NextResponse.json({ error: "Could not load entries." }, { status: 500 });
  }
}
