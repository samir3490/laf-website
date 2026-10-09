import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { LAF_EVENT_COMPETITION_COLLECTION } from "@/lib/event-analytics";
import {
  isEventAdmin,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";

const AGE_GROUPS = new Set(["ages_6_10", "ages_11_16"]);

export async function POST(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isEventAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const ageGroup = typeof body.ageGroup === "string" ? body.ageGroup.trim() : "";

    if (!entryId || !AGE_GROUPS.has(ageGroup)) {
      return NextResponse.json({ error: "Entry ID and age group are required." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const entrySnap = await adminDb.collection(LAF_EVENT_SUBMISSIONS_COLLECTION).doc(entryId).get();
    if (!entrySnap.exists || entrySnap.data()?.eventSlug !== YOUNG_INNOVATORS_2026_EVENT_SLUG) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    const metaRef = adminDb
      .collection(LAF_EVENT_COMPETITION_COLLECTION)
      .doc(YOUNG_INNOVATORS_2026_EVENT_SLUG);
    const metaSnap = await metaRef.get();
    const existing = (metaSnap.data()?.winnersByAgeGroup as Record<string, string> | undefined) ?? {};

    await metaRef.set(
      {
        title: "Young Innovators Challenge 2026",
        eventSlug: YOUNG_INNOVATORS_2026_EVENT_SLUG,
        winnersByAgeGroup: { ...existing, [ageGroup]: entryId },
        winnerAnnouncedAt: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: email,
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, ageGroup, entryId });
  } catch (err) {
    console.error("[innovators/admin/winner]", err);
    return NextResponse.json({ error: "Could not announce winner." }, { status: 500 });
  }
}
