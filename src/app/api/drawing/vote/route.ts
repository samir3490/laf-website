import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  competitionPhase,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_ENTRIES_COLLECTION,
  DRAWING_META_DOC_ID,
  DRAWING_VOTER_COOKIE,
  DRAWING_VOTES_COLLECTION,
  normalizeCompetitionMeta,
  voteDocId,
} from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function ipHash(ip: string): string {
  return createHash("sha256").update(`drawing-vote:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-vote:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many votes. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Voting is temporarily unavailable." }, { status: 503 });
    }

    const metaSnap = await adminDb
      .collection(DRAWING_COMPETITION_COLLECTION)
      .doc(DRAWING_META_DOC_ID)
      .get();
    const meta = normalizeCompetitionMeta(metaSnap.data() as Record<string, unknown> | undefined);
    const { votingAllowed } = competitionPhase(meta);
    if (!votingAllowed) {
      return NextResponse.json({ error: "Voting is closed for this competition." }, { status: 403 });
    }

    const entryRef = adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    if (!entrySnap.exists || entrySnap.data()?.status !== "active") {
      return NextResponse.json({ error: "This entry is not available." }, { status: 404 });
    }

    const cookieStore = await cookies();
    let voterId = cookieStore.get(DRAWING_VOTER_COOKIE)?.value;
    const setCookie = !voterId;
    if (!voterId) voterId = randomUUID();

    const voteRef = adminDb.collection(DRAWING_VOTES_COLLECTION).doc(voteDocId(voterId, entryId));
    let voteCount = typeof entrySnap.data()?.voteCount === "number" ? entrySnap.data()!.voteCount : 0;
    let alreadyVoted = false;

    await adminDb.runTransaction(async (tx) => {
      const existingVote = await tx.get(voteRef);
      if (existingVote.exists) {
        alreadyVoted = true;
        return;
      }

      tx.set(voteRef, {
        voterId,
        entryId,
        ipHash: ipHash(ip),
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(entryRef, { voteCount: FieldValue.increment(1) });
      voteCount += 1;
    });

    const response = NextResponse.json({ ok: true, voteCount, alreadyVoted, entryId });
    if (setCookie) {
      response.cookies.set(DRAWING_VOTER_COOKIE, voterId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return response;
  } catch (err) {
    console.error("[drawing/vote]", err);
    return NextResponse.json({ error: "Vote failed. Please try again." }, { status: 500 });
  }
}
