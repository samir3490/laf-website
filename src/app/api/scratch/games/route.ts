import { NextResponse } from "next/server";
import { SCRATCH_GAMES_COLLECTION } from "@/lib/firebase";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { normalizeScratchGame } from "@/lib/scratch-server";

export async function GET() {
  try {
    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Games service is temporarily unavailable." }, { status: 503 });
    }

    const snap = await adminDb.collection(SCRATCH_GAMES_COLLECTION).get();
    const games = snap.docs
      .map((doc) => normalizeScratchGame(doc.id, doc.data()))
      .filter((game): game is NonNullable<typeof game> => game !== null)
      .sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });

    return NextResponse.json(
      { games },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Could not load games." }, { status: 500 });
  }
}
