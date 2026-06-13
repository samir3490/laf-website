import { NextResponse } from "next/server";
import {
  generateOtpCode,
  sendDrawingEmailOtp,
  storeEmailOtp,
} from "@/lib/drawing-email-otp";
import { isValidEmail, normalizeEmail } from "@/lib/drawing";
import { isMailConfigured } from "@/lib/mail";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";

const SEND_RATE_IP = 10;
const SEND_RATE_EMAIL = 3;
const SEND_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Email verification is not configured. Please contact LAF." },
        { status: 503 }
      );
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-email-otp-ip:${ip}`, SEND_RATE_IP, SEND_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const turnstileError = requireTurnstileInProduction();
    if (turnstileError) {
      return NextResponse.json({ error: turnstileError }, { status: 503 });
    }

    const body = await req.json();
    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    const email = normalizeEmail(rawEmail);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!checkRateLimit(`drawing-email-otp:${email}`, SEND_RATE_EMAIL, SEND_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many codes sent to this email. Please try again in an hour." },
        { status: 429 }
      );
    }

    if (isTurnstileEnabled()) {
      const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      const valid = await verifyTurnstileToken(token, ip);
      if (!valid) {
        return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 403 });
      }
    }

    const code = generateOtpCode();
    await storeEmailOtp(email, code);
    const sent = await sendDrawingEmailOtp(email, code);
    if (!sent) {
      return NextResponse.json({ error: "Could not send email. Please try again later." }, { status: 503 });
    }

    return NextResponse.json({ ok: true, message: "Verification code sent. Check your inbox (and spam folder)." });
  } catch (err) {
    console.error("[drawing/verify-email/send]", err);
    return NextResponse.json({ error: "Could not send verification code." }, { status: 500 });
  }
}
