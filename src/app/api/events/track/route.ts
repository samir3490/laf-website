import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  attributionFromPayload,
  LAF_EVENT_ANALYTICS_COLLECTION,
  type EventAnalyticsEventType,
  type EventAnalyticsPage,
} from "@/lib/event-analytics";
import { YOUNG_INNOVATORS_2026_EVENT_SLUG } from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const ALLOWED_EVENTS: EventAnalyticsEventType[] = [
  "page_view",
  "otp_sent",
  "otp_verified",
  "submit_success",
  "submit_failed",
];

const ALLOWED_SLUGS = new Set([YOUNG_INNOVATORS_2026_EVENT_SLUG]);

function ipHash(ip: string): string {
  return createHash("sha256").update(`event-analytics:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`event-track:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug.trim() : "";
    if (!ALLOWED_SLUGS.has(eventSlug)) {
      return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    }

    const event = body.event;
    if (!ALLOWED_EVENTS.includes(event as EventAnalyticsEventType)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const page = body.page;
    if (
      page !== undefined &&
      page !== "home" &&
      page !== "gallery" &&
      page !== "submit"
    ) {
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

    await adminDb.collection(LAF_EVENT_ANALYTICS_COLLECTION).doc(randomUUID()).set({
      eventSlug,
      type: event,
      ...(page ? { page: page as EventAnalyticsPage } : {}),
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
    console.error("[events/track]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
