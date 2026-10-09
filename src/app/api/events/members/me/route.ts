import { NextResponse } from "next/server";
import { LAF_EVENT_MEMBERS_COLLECTION } from "@/lib/event-members";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";

export async function GET(req: Request) {
  try {
    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const snap = await adminDb.collection(LAF_EVENT_MEMBERS_COLLECTION).doc(decoded.uid).get();
    if (!snap.exists) {
      return NextResponse.json({ exists: false, notifyNewEvents: true });
    }

    const data = snap.data()!;
    return NextResponse.json({
      exists: true,
      email: data.email ?? decoded.email,
      displayName: data.displayName ?? null,
      notifyNewEvents: data.notifyNewEvents !== false,
    });
  } catch (err) {
    console.error("[events/members/me]", err);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}
