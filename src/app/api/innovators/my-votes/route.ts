import { NextResponse } from "next/server";
import {
  LAF_EVENT_VOTES_COLLECTION,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { isGoogleAuth, verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";

export async function GET(req: Request) {
  try {
    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded || !isGoogleAuth(decoded)) {
      return NextResponse.json({ error: "Sign in with Google to see your votes." }, { status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const snap = await adminDb
      .collection(LAF_EVENT_VOTES_COLLECTION)
      .where("eventSlug", "==", YOUNG_INNOVATORS_2026_EVENT_SLUG)
      .where("voterUid", "==", decoded.uid)
      .get();

    const entryIds = snap.docs
      .map((d) => d.data().entryId)
      .filter((id): id is string => typeof id === "string");

    return NextResponse.json({ entryIds });
  } catch {
    return NextResponse.json({ error: "Could not load votes." }, { status: 500 });
  }
}
