import { createHash } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  LAF_EVENT_REPORT_REASONS,
  LAF_EVENT_REPORTS_COLLECTION,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  type LafEventReportReason,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { notifyAdminOfInnovatorsReport } from "@/lib/innovators-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const VALID_REASONS = LAF_EVENT_REPORT_REASONS.map((r) => r.value);

function ipHash(ip: string): string {
  return createHash("sha256").update(`innovators-report:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`innovators-report:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim().slice(0, 500) : "";

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }
    if (!VALID_REASONS.includes(reason as LafEventReportReason)) {
      return NextResponse.json({ error: "Please select a valid reason." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Reports are temporarily unavailable." }, { status: 503 });
    }

    const entrySnap = await adminDb.collection(LAF_EVENT_SUBMISSIONS_COLLECTION).doc(entryId).get();
    const data = entrySnap.data();
    if (
      !entrySnap.exists ||
      data?.status !== "approved" ||
      data?.eventSlug !== YOUNG_INNOVATORS_2026_EVENT_SLUG
    ) {
      return NextResponse.json({ error: "This entry is not available." }, { status: 404 });
    }

    const title = String(data?.title ?? "Untitled");

    await adminDb.collection(LAF_EVENT_REPORTS_COLLECTION).add({
      eventSlug: YOUNG_INNOVATORS_2026_EVENT_SLUG,
      entryId,
      reason,
      details: details || null,
      status: "open",
      reporterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    void notifyAdminOfInnovatorsReport({
      entryId,
      title,
      reason,
      details: details || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[innovators/report]", err);
    return NextResponse.json({ error: "Report failed. Please try again." }, { status: 500 });
  }
}
