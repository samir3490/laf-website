import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { LAF_EVENT_MEMBERS_COLLECTION } from "@/lib/event-members";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";

export async function POST(req: Request) {
  try {
    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const body = await req.json();
    const notifyNewEvents = body.notifyNewEvents === true;

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const ref = adminDb.collection(LAF_EVENT_MEMBERS_COLLECTION).doc(decoded.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Profile not found. Refresh and try again." }, { status: 404 });
    }

    await ref.update({
      notifyNewEvents,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, notifyNewEvents });
  } catch (err) {
    console.error("[events/members/notify]", err);
    return NextResponse.json({ error: "Could not update preference." }, { status: 500 });
  }
}
