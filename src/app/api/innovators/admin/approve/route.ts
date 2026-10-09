import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  isEventAdmin,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";

export async function POST(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isEventAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const action = body.action === "remove" ? "remove" : "approve";

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const entryRef = adminDb.collection(LAF_EVENT_SUBMISSIONS_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    if (!entrySnap.exists || entrySnap.data()?.eventSlug !== YOUNG_INNOVATORS_2026_EVENT_SLUG) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    if (action === "approve") {
      await entryRef.update({
        status: "approved",
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: email,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, status: "approved" });
    }

    await entryRef.update({
      status: "removed",
      removedAt: FieldValue.serverTimestamp(),
      removedBy: email,
      rejectReason:
        typeof body.reason === "string" ? body.reason.slice(0, 200) : "Removed by admin",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, status: "removed" });
  } catch (err) {
    console.error("[innovators/admin/approve]", err);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
