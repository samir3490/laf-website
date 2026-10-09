import { NextResponse } from "next/server";
import {
  generateEventOtpCode,
  sendEventEmailOtp,
  storeEventEmailOtp,
} from "@/lib/event-email-otp";
import {
  isValidEventEmail,
  normalizeEventEmail,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { isMailConfigured } from "@/lib/mail";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const SEND_RATE_IP = 10;
const SEND_RATE_EMAIL = 3;
const SEND_WINDOW_MS = 60 * 60 * 1000;

/** Allowed event slugs for shared OTP — add new events here. */
const EVENT_LABELS: Record<string, string> = {
  [YOUNG_INNOVATORS_2026_EVENT_SLUG]: "Young Innovators Challenge",
};

export async function POST(req: Request) {
  try {
    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Email verification is not configured. Please contact LAF." },
        { status: 503 }
      );
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`event-email-otp-ip:${ip}`, SEND_RATE_IP, SEND_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const eventSlug = typeof body.eventSlug === "string" ? body.eventSlug.trim() : "";
    const eventLabel = EVENT_LABELS[eventSlug];
    if (!eventLabel) {
      return NextResponse.json({ error: "Unknown event." }, { status: 400 });
    }

    const email = normalizeEventEmail(typeof body.email === "string" ? body.email : "");
    if (!email || !isValidEventEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!checkRateLimit(`event-email-otp:${eventSlug}:${email}`, SEND_RATE_EMAIL, SEND_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many codes sent to this email. Please try again in an hour." },
        { status: 429 }
      );
    }

    const code = generateEventOtpCode();
    await storeEventEmailOtp(eventSlug, email, code);
    const sent = await sendEventEmailOtp(email, code, eventLabel);
    if (!sent) {
      return NextResponse.json({ error: "Could not send email. Please try again later." }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      message: "Verification code sent. Check your inbox (and spam folder).",
    });
  } catch (err) {
    console.error("[events/verify-email/send]", err);
    return NextResponse.json({ error: "Could not send verification code." }, { status: 500 });
  }
}
