import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { DRAWING_ENTRIES_COLLECTION, isDrawingAdmin } from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";

export async function POST(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isDrawingAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const score = Number(body.judgeScore);

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return NextResponse.json({ error: "Judge score must be between 0 and 100." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const entryRef = adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    if (!entrySnap.exists || entrySnap.data()?.status !== "active") {
      return NextResponse.json({ error: "Active entry not found." }, { status: 404 });
    }

    await entryRef.update({
      judgeScore: Math.round(score),
      judgeScoredAt: FieldValue.serverTimestamp(),
      judgeScoredBy: email,
    });

    return NextResponse.json({ ok: true, judgeScore: Math.round(score) });
  } catch (err) {
    console.error("[drawing/admin/judge-score]", err);
    return NextResponse.json({ error: "Save failed." }, { status: 500 });
  }
}
