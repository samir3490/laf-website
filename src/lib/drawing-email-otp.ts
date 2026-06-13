import { createHash, randomInt, randomUUID } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { normalizeEmail } from "@/lib/drawing";
import { DRAWING_ENTRIES_COLLECTION } from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { sendFoundationEmail } from "@/lib/mail";

export const DRAWING_EMAIL_OTPS_COLLECTION = "drawing_email_otps";
export const DRAWING_EMAIL_SESSIONS_COLLECTION = "drawing_email_sessions";

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export function emailDocId(email: string): string {
  return createHash("sha256").update(`drawing-email:${normalizeEmail(email)}`).digest("hex").slice(0, 32);
}

function otpCodeHash(email: string, code: string): string {
  return createHash("sha256").update(`drawing-otp:${normalizeEmail(email)}:${code}`).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export async function storeEmailOtp(email: string, code: string): Promise<void> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb) throw new Error("Database unavailable.");

  await adminDb.collection(DRAWING_EMAIL_OTPS_COLLECTION).doc(emailDocId(email)).set({
    codeHash: otpCodeHash(email, code),
    expiresAt: Timestamp.fromMillis(Date.now() + OTP_TTL_MS),
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function sendDrawingEmailOtp(email: string, code: string): Promise<boolean> {
  const subject = "Your LAF Drawing Competition verification code";
  const text = `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `<p>Your verification code is <strong style="font-size:20px;letter-spacing:2px">${code}</strong>.</p><p>It expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>`;

  return sendFoundationEmail({ to: email, subject, text, html });
}

export async function verifyEmailOtpAndCreateSession(
  email: string,
  code: string
): Promise<{ verifyToken: string } | { error: string }> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb) return { error: "Verification is temporarily unavailable." };

  const docRef = adminDb.collection(DRAWING_EMAIL_OTPS_COLLECTION).doc(emailDocId(email));
  const snap = await docRef.get();
  if (!snap.exists) return { error: "Invalid or expired code. Request a new OTP." };

  const data = snap.data()!;
  const expiresAt = data.expiresAt as Timestamp | undefined;
  if (!expiresAt || expiresAt.toMillis() < Date.now()) {
    await docRef.delete().catch(() => undefined);
    return { error: "This code has expired. Request a new OTP." };
  }

  const attempts = typeof data.attempts === "number" ? data.attempts : 0;
  if (attempts >= MAX_OTP_ATTEMPTS) {
    return { error: "Too many incorrect attempts. Request a new OTP." };
  }

  const expectedHash = typeof data.codeHash === "string" ? data.codeHash : "";
  if (expectedHash !== otpCodeHash(email, code.trim())) {
    await docRef.update({ attempts: attempts + 1 });
    return { error: "Incorrect code. Please try again." };
  }

  await docRef.delete().catch(() => undefined);

  const verifyToken = randomUUID();
  await adminDb.collection(DRAWING_EMAIL_SESSIONS_COLLECTION).doc(verifyToken).set({
    email: normalizeEmail(email),
    expiresAt: Timestamp.fromMillis(Date.now() + SESSION_TTL_MS),
    createdAt: FieldValue.serverTimestamp(),
  });

  return { verifyToken };
}

export async function verifyDrawingEmailSession(
  verifyToken: string,
  parentEmail: string
): Promise<{ email: string } | null> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb || !verifyToken) return null;

  const snap = await adminDb.collection(DRAWING_EMAIL_SESSIONS_COLLECTION).doc(verifyToken).get();
  if (!snap.exists) return null;

  const data = snap.data()!;
  const expiresAt = data.expiresAt as Timestamp | undefined;
  if (!expiresAt || expiresAt.toMillis() < Date.now()) {
    await snap.ref.delete().catch(() => undefined);
    return null;
  }

  const sessionEmail = typeof data.email === "string" ? data.email : "";
  if (sessionEmail !== normalizeEmail(parentEmail)) return null;

  return { email: sessionEmail };
}

export async function countActiveEntriesForEmail(email: string): Promise<number> {
  const adminDb = getFirebaseAdminDb();
  if (!adminDb) return 0;

  const hash = emailDocId(email);
  const snap = await adminDb.collection(DRAWING_ENTRIES_COLLECTION).where("submitterEmailHash", "==", hash).get();
  return snap.docs.filter((d) => {
    const s = d.data().status;
    return s === "pending" || s === "active";
  }).length;
}
