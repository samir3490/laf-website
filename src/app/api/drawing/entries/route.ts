import { NextResponse } from "next/server";
import { DRAWING_ENTRIES_COLLECTION, entryCreatedAtMs } from "@/lib/drawing";
import { normalizeDrawingEntryForApi } from "@/lib/drawing-server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Gallery is temporarily unavailable." }, { status: 503 });
    }

    const snap = await adminDb.collection(DRAWING_ENTRIES_COLLECTION).where("status", "==", "active").get();

    const entries = snap.docs
      .map((doc) => normalizeDrawingEntryForApi(doc.id, doc.data()))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => entryCreatedAtMs(b) - entryCreatedAtMs(a));

    return NextResponse.json(
      { entries },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error("[drawing/entries]", err);
    return NextResponse.json({ error: "Could not load entries." }, { status: 500 });
  }
}
