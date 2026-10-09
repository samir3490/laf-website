import { createHash, randomInt, randomUUID } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { normalizeEventEmail } from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { sendFoundationEmail } from "@/lib/mail";

/** Shared OTP storage for all LAF website events (not Drawing — that keeps drawing_email_*). */
export const LAF_EVENT_EMAIL_OTPS_COLLECTION = "laf_event_email_otps";
export const LAF_EVENT_EMAIL_SESSIONS_COLLECTION = "laf_event_email_sessions";

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export function eventEmailDocId(eventSlug: string, email: string): string {
  return createHash("sha256")
    .update(`laf-event-email:${eventSlug}:${normalizeEventEmail(email)}`)
    .digest("hex")
    .slice(0, 32);
}

function otpCodeHash(eventSlug: string, email: string, code: string): string {
  return createHash("sha256")
    .update(`laf-event-otp:${eventSlug}:${normalizeEventEmail(email)}:${code}`)
    .digest("hex");
}

export function generateEventOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export async function storeEventEmailOtp(
  eventSlug: string,
  email: string,
  code: string
): Promise<void> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb) throw new Error("Database unavailable.");

  await adminDb.collection(LAF_EVENT_EMAIL_OTPS_COLLECTION).doc(eventEmailDocId(eventSlug, email)).set({
    eventSlug,
    codeHash: otpCodeHash(eventSlug, email, code),
    expiresAt: Timestamp.fromMillis(Date.now() + OTP_TTL_MS),
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function sendEventEmailOtp(
  email: string,
  code: string,
  eventLabel: string
): Promise<boolean> {
  const subject = `Your LAF verification code — ${eventLabel}`;
  const text = `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `<p>Your verification code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p><p>It expires in 10 minutes.</p><p>Event: ${eventLabel}</p><p>If you did not request this, you can ignore this email.</p>`;

  return sendFoundationEmail({ to: email, subject, text, html });
}

export async function verifyEventEmailOtpAndCreateSession(
  eventSlug: string,
  email: string,
  code: string
): Promise<{ verifyToken: string } | { error: string }> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb) return { error: "Verification is temporarily unavailable." };

  const docRef = adminDb
    .collection(LAF_EVENT_EMAIL_OTPS_COLLECTION)
    .doc(eventEmailDocId(eventSlug, email));
  const snap = await docRef.get();
  if (!snap.exists) return { error: "Invalid or expired code. Request a new code." };

  const data = snap.data()!;
  if (data.eventSlug !== eventSlug) {
    return { error: "Invalid or expired code. Request a new code." };
  }

  const expiresAt = data.expiresAt as Timestamp | undefined;
  if (!expiresAt || expiresAt.toMillis() < Date.now()) {
    await docRef.delete().catch(() => undefined);
    return { error: "This code has expired. Request a new code." };
  }

  const attempts = typeof data.attempts === "number" ? data.attempts : 0;
  if (attempts >= MAX_OTP_ATTEMPTS) {
    return { error: "Too many incorrect attempts. Request a new code." };
  }

  const expectedHash = typeof data.codeHash === "string" ? data.codeHash : "";
  if (expectedHash !== otpCodeHash(eventSlug, email, code.trim())) {
    await docRef.update({ attempts: attempts + 1 });
    return { error: "Incorrect code. Please try again." };
  }

  await docRef.delete().catch(() => undefined);

  const verifyToken = randomUUID();
  await adminDb.collection(LAF_EVENT_EMAIL_SESSIONS_COLLECTION).doc(verifyToken).set({
    eventSlug,
    email: normalizeEventEmail(email),
    expiresAt: Timestamp.fromMillis(Date.now() + SESSION_TTL_MS),
    createdAt: FieldValue.serverTimestamp(),
  });

  return { verifyToken };
}

export async function verifyEventEmailSession(
  eventSlug: string,
  verifyToken: string,
  email: string
): Promise<{ email: string } | null> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb || !verifyToken) return null;

  const snap = await adminDb.collection(LAF_EVENT_EMAIL_SESSIONS_COLLECTION).doc(verifyToken).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  if (data.eventSlug !== eventSlug) return null;

  const expiresAt = data.expiresAt as Timestamp | undefined;
  if (!expiresAt || expiresAt.toMillis() < Date.now()) {
    await snap.ref.delete().catch(() => undefined);
    return null;
  }

  const sessionEmail = typeof data.email === "string" ? data.email : "";
  if (sessionEmail !== normalizeEventEmail(email)) return null;

  return { email: sessionEmail };
}
