import { NextResponse } from "next/server";
import { DRAWING_VOTES_COLLECTION } from "@/lib/drawing";
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
      .collection(DRAWING_VOTES_COLLECTION)
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
