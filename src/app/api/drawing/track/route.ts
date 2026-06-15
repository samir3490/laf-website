import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  attributionFromPayload,
  DRAWING_ANALYTICS_EVENTS_COLLECTION,
  type DrawingAnalyticsEventType,
  type DrawingAnalyticsPage,
} from "@/lib/drawing-analytics";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const ALLOWED_EVENTS: DrawingAnalyticsEventType[] = [
  "page_view",
  "otp_sent",
  "otp_verified",
  "submit_success",
  "submit_failed",
];

function ipHash(ip: string): string {
  return createHash("sha256").update(`drawing-analytics:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-track:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const event = body.event;
    if (!ALLOWED_EVENTS.includes(event as DrawingAnalyticsEventType)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const page = body.page;
    if (page !== undefined && page !== "gallery" && page !== "submit") {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const attribution = attributionFromPayload(
      body.attribution as Record<string, unknown> | undefined
    );
    const source = attribution?.source ?? "direct";

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ ok: true });
    }

    await adminDb.collection(DRAWING_ANALYTICS_EVENTS_COLLECTION).doc(randomUUID()).set({
      type: event,
      ...(page ? { page } : {}),
      source,
      ...(attribution?.utmSource ? { utmSource: attribution.utmSource } : {}),
      ...(attribution?.utmMedium ? { utmMedium: attribution.utmMedium } : {}),
      ...(attribution?.utmCampaign ? { utmCampaign: attribution.utmCampaign } : {}),
      ...(typeof body.entryId === "string" ? { entryId: body.entryId } : {}),
      visitorHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[drawing/track]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
