import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  DRAWING_ENTRIES_COLLECTION,
  DRAWING_REPORTS_COLLECTION,
  type DrawingReportReason,
} from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { notifyAdminOfDrawingReport } from "@/lib/drawing-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const VALID_REASONS: DrawingReportReason[] = ["inappropriate", "not_original", "spam", "other"];

function ipHash(ip: string): string {
  return createHash("sha256").update(`drawing-report:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-report:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim().slice(0, 500) : "";

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }
    if (!VALID_REASONS.includes(reason as DrawingReportReason)) {
      return NextResponse.json({ error: "Please select a valid reason." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Reports are temporarily unavailable." }, { status: 503 });
    }

    const entrySnap = await adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId).get();
    if (!entrySnap.exists || entrySnap.data()?.status !== "active") {
      return NextResponse.json({ error: "This entry is not available." }, { status: 404 });
    }

    const title = String(entrySnap.data()?.title ?? "Untitled");

    await adminDb.collection(DRAWING_REPORTS_COLLECTION).add({
      entryId,
      reason,
      details: details || null,
      status: "open",
      reporterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    void notifyAdminOfDrawingReport({ entryId, title, reason, details: details || undefined });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[drawing/report]", err);
    return NextResponse.json({ error: "Report failed. Please try again." }, { status: 500 });
  }
}
