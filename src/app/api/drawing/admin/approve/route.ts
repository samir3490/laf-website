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
    const action = body.action === "reject" ? "reject" : "approve";

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const entryRef = adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    if (!entrySnap.exists) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    if (action === "approve") {
      await entryRef.update({
        status: "active",
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: email,
      });
      return NextResponse.json({ ok: true, status: "active" });
    }

    await entryRef.update({
      status: "removed",
      removedAt: FieldValue.serverTimestamp(),
      removedBy: email,
      rejectReason: typeof body.reason === "string" ? body.reason.slice(0, 200) : "Rejected by admin",
    });
    return NextResponse.json({ ok: true, status: "removed" });
  } catch (err) {
    console.error("[drawing/admin/approve]", err);
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
