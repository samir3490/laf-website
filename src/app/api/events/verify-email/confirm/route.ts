import { NextResponse } from "next/server";
import { verifyEventEmailOtpAndCreateSession } from "@/lib/event-email-otp";
import {
  isValidEventEmail,
  normalizeEventEmail,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const CONFIRM_RATE = 20;
const CONFIRM_WINDOW_MS = 60 * 60 * 1000;

const ALLOWED_SLUGS = new Set([YOUNG_INNOVATORS_2026_EVENT_SLUG]);

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`event-email-confirm:${ip}`, CONFIRM_RATE, CONFIRM_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug.trim() : "";
    if (!ALLOWED_SLUGS.has(eventSlug)) {
      return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    }

    const email = normalizeEventEmail(typeof body.email === "string" ? body.email : "");
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "").slice(0, 6) : "";

    if (!email || !isValidEventEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (code.length !== 6) {
      return NextResponse.json({ error: "Please enter the 6-digit code from your email." }, { status: 400 });
    }

    const result = await verifyEventEmailOtpAndCreateSession(eventSlug, email, code);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, verifyToken: result.verifyToken, email });
  } catch (err) {
    console.error("[events/verify-email/confirm]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
