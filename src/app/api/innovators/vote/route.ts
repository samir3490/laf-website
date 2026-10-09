import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  eventVoteDocId,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  LAF_EVENT_VOTES_COLLECTION,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { isGoogleAuth, verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";
import { isYoungInnovatorsOpen } from "@/lib/young-innovators";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const EVENT_SLUG = YOUNG_INNOVATORS_2026_EVENT_SLUG;

function ipHash(ip: string): string {
  return createHash("sha256").update(`innovators-vote:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded || !isGoogleAuth(decoded)) {
      return NextResponse.json(
        { error: "Please sign in with Google to vote. One Google account = one vote per project." },
        { status: 401 }
      );
    }

    if (!isYoungInnovatorsOpen()) {
      return NextResponse.json({ error: "Voting is closed for this challenge." }, { status: 403 });
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`innovators-vote:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many votes. Please try again later." }, { status: 429 });
    }
    if (!checkRateLimit(`innovators-vote-user:${decoded.uid}`, RATE_LIMIT, RATE_WINDOW_MS)) {
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

    const entryRef = adminDb.collection(LAF_EVENT_SUBMISSIONS_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    const entryData = entrySnap.data();
    if (
      !entrySnap.exists ||
      entryData?.status !== "approved" ||
      entryData?.eventSlug !== EVENT_SLUG
    ) {
      return NextResponse.json({ error: "This entry is not available." }, { status: 404 });
    }

    const voterUid = decoded.uid;
    const voteRef = adminDb
      .collection(LAF_EVENT_VOTES_COLLECTION)
      .doc(eventVoteDocId(EVENT_SLUG, voterUid, entryId));
    let voteCount = typeof entryData?.voteCount === "number" ? entryData.voteCount : 0;
    let alreadyVoted = false;

    await adminDb.runTransaction(async (tx) => {
      const existingVote = await tx.get(voteRef);
      if (existingVote.exists) {
        alreadyVoted = true;
        return;
      }

      tx.set(voteRef, {
        eventSlug: EVENT_SLUG,
        entryId,
        voterUid,
        voterEmail: decoded.email ?? null,
        voterIpHash: ipHash(ip),
        createdAt: FieldValue.serverTimestamp(),
      });
      voteCount += 1;
      tx.update(entryRef, {
        voteCount,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ ok: true, voteCount, alreadyVoted });
  } catch (err) {
    console.error("[innovators/vote]", err);
    return NextResponse.json({ error: "Vote failed. Please try again." }, { status: 500 });
  }
}
