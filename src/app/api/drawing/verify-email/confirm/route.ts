import { NextResponse } from "next/server";
import { verifyEmailOtpAndCreateSession } from "@/lib/drawing-email-otp";
import { isValidEmail, normalizeEmail } from "@/lib/drawing";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const CONFIRM_RATE = 20;
const CONFIRM_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-email-confirm:${ip}`, CONFIRM_RATE, CONFIRM_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const email = normalizeEmail(typeof body.email === "string" ? body.email : "");
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "").slice(0, 6) : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (code.length !== 6) {
      return NextResponse.json({ error: "Please enter the 6-digit code from your email." }, { status: 400 });
    }

    const result = await verifyEmailOtpAndCreateSession(email, code);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, verifyToken: result.verifyToken, email });
  } catch (err) {
    console.error("[drawing/verify-email/confirm]", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
