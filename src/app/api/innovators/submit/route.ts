import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { attributionFromPayload } from "@/lib/event-analytics";
import { verifyEventEmailSession } from "@/lib/event-email-otp";
import {
  innovatorsAgeGroupFromAge,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  normalizeEventEmail,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { notifyAdminOfInnovatorsSubmission } from "@/lib/innovators-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";
import { normalizeInternationalMobile } from "@/lib/phone-e164";
import {
  isAllowedDriveOrVideoUrl,
  isAllowedVideoLink,
  isValidInnovatorsEmail,
  isYoungInnovatorsOpen,
  YOUNG_INNOVATORS_AGE,
} from "@/lib/young-innovators";

export const maxDuration = 60;

const IP_RATE_LIMIT = 40;
const EMAIL_RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function jsonError(error: string, code: string, status = 400) {
  return NextResponse.json({ error, code }, { status });
}

function ipHash(ip: string): string {
  return createHash("sha256").update(`innovators:${ip}`).digest("hex").slice(0, 16);
}

function emailHash(email: string): string {
  return createHash("sha256")
    .update(`innovators-email:${normalizeEventEmail(email)}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(req: Request) {
  try {
    if (!isYoungInnovatorsOpen()) {
      return jsonError(
        "Submissions are closed for this challenge. Please check back for the next event.",
        "closed",
        403
      );
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`innovators-submit:${ip}`, IP_RATE_LIMIT, RATE_WINDOW_MS)) {
      return jsonError(
        "This network has reached today's submission limit. Please try again tomorrow.",
        "rate_limited",
        429
      );
    }

    const turnstileError = requireTurnstileInProduction();
    if (turnstileError) {
      return jsonError(turnstileError, "captcha", 503);
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return jsonError("Invalid request.", "invalid_request");
    }

    // Obscure honeypot only — do NOT use "website" (browsers autofill it and skip real saves).
    if (typeof body.laf_hp_xf7 === "string" && body.laf_hp_xf7.trim()) {
      return NextResponse.json({ ok: true, entryId: "ok" });
    }

    if (isTurnstileEnabled()) {
      const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      const valid = await verifyTurnstileToken(token, ip);
      if (!valid) {
        return jsonError("Please complete the captcha and try again.", "captcha", 403);
      }
    }

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const childName = String(body.childName ?? "").trim();
    const contactName = String(body.contactName ?? body.parentName ?? "").trim();
    const contactEmailRaw = String(body.contactEmail ?? body.parentEmail ?? "").trim();
    const contactPhoneRaw = String(body.contactPhone ?? body.parentPhone ?? "").trim();
    const childCity = String(body.childCity ?? "").trim();
    const childSchool = String(body.childSchool ?? "").trim();
    const ageRaw = String(body.childAge ?? "").trim();
    const photo1Url = String(body.photo1Url ?? "").trim();
    const photo2Url = String(body.photo2Url ?? "").trim();
    const videoUrl = String(body.videoUrl ?? "").trim();
    const photo1FileId = String(body.photo1FileId ?? "").trim();
    const photo2FileId = String(body.photo2FileId ?? "").trim();
    const verifyToken = String(body.verifyToken ?? "").trim();
    const termsAccepted = body.termsAccepted === true;
    const attribution = attributionFromPayload(
      body.attribution as Record<string, unknown> | undefined
    );

    const contactEmail = normalizeEventEmail(contactEmailRaw);
    if (!contactEmail || !isValidInnovatorsEmail(contactEmail) || contactEmail.length > 120) {
      return jsonError("Please enter a valid email address.", "invalid_email");
    }

    const session = await verifyEventEmailSession(
      YOUNG_INNOVATORS_2026_EVENT_SLUG,
      verifyToken,
      contactEmail
    );
    if (!session) {
      return jsonError(
        "Your email verification expired. Please request a new code and try again.",
        "email_unverified",
        401
      );
    }

    if (!checkRateLimit(`innovators-submit-email:${emailHash(contactEmail)}`, EMAIL_RATE_LIMIT, RATE_WINDOW_MS)) {
      return jsonError(
        "This email has already submitted today's limit. Please try again tomorrow.",
        "rate_limited",
        429
      );
    }

    if (!title || title.length > 120) {
      return jsonError("Please enter a project title (max 120 characters).", "invalid_title");
    }
    if (!description || description.length < 20 || description.length > 2000) {
      return jsonError(
        "Please describe the project in 20–2000 characters (materials used and how it works).",
        "invalid_description"
      );
    }
    if (!childName || childName.length > 40) {
      return jsonError("Please enter the child's first name only (max 40 characters).", "invalid_name");
    }
    if (!contactName || contactName.length > 80) {
      return jsonError("Please enter your name.", "invalid_name");
    }
    const phoneCountry = String(body.phoneCountry ?? "IN").trim();
    const contactPhone = normalizeInternationalMobile(contactPhoneRaw, phoneCountry);
    if (!contactPhone) {
      return jsonError(
        "Please enter a valid mobile number for the country you selected.",
        "invalid_phone"
      );
    }
    if (!childCity || childCity.length > 80) {
      return jsonError("Please enter your city.", "invalid_city");
    }
    if (childSchool.length > 120) {
      return jsonError("School name is too long.", "invalid_school");
    }

    const age = parseInt(ageRaw, 10);
    if (
      !Number.isFinite(age) ||
      age < YOUNG_INNOVATORS_AGE.min ||
      age > YOUNG_INNOVATORS_AGE.max
    ) {
      return jsonError(
        `Child must be between ${YOUNG_INNOVATORS_AGE.min} and ${YOUNG_INNOVATORS_AGE.max} years old.`,
        "invalid_age"
      );
    }

    const ageGroup = innovatorsAgeGroupFromAge(age);
    if (!ageGroup) {
      return jsonError("Invalid age for this challenge.", "invalid_age");
    }

    if (!termsAccepted) {
      return jsonError("Please accept the terms to submit the project.", "invalid_terms");
    }

    if (!photo1Url || !isAllowedDriveOrVideoUrl(photo1Url)) {
      return jsonError("Please upload at least one clear project photo.", "invalid_photo");
    }

    if (photo2Url && !isAllowedDriveOrVideoUrl(photo2Url)) {
      return jsonError("Photo 2 link looks invalid. Remove it or upload again.", "invalid_photo");
    }

    if (videoUrl && !isAllowedVideoLink(videoUrl)) {
      return jsonError(
        "Video link must be YouTube or Google Drive (or leave it blank).",
        "invalid_video"
      );
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return jsonError(
        "Submissions are temporarily unavailable. Please try again later.",
        "server_error",
        503
      );
    }

    const entryId = randomUUID();
    const doc = {
      eventSlug: YOUNG_INNOVATORS_2026_EVENT_SLUG,
      title,
      description,
      childName,
      childAge: age,
      childCity,
      childSchool: childSchool || null,
      ageGroup,
      contactName,
      contactEmail,
      contactPhone,
      photo1Url,
      photo2Url: photo2Url || null,
      photo1FileId: photo1FileId || null,
      photo2FileId: photo2FileId || null,
      videoUrl: videoUrl || null,
      videoSource: videoUrl ? "link" : null,
      status: "pending",
      voteCount: 0,
      termsAccepted: true,
      trafficSource: attribution?.source ?? "direct",
      submitterIpHash: ipHash(ip),
      submitterEmailHash: emailHash(contactEmail),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection(LAF_EVENT_SUBMISSIONS_COLLECTION).doc(entryId).set(doc);

    // Must await on Vercel — fire-and-forget emails are often killed after the response.
    let adminNotified = false;
    try {
      adminNotified = await notifyAdminOfInnovatorsSubmission({
        entryId,
        title,
        childName,
        parentEmail: contactEmail,
        photo1Url,
        photo2Url: photo2Url || "",
        videoUrl: videoUrl || "",
      });
    } catch (notifyErr) {
      console.error("[innovators/submit] admin notify failed", notifyErr);
    }

    return NextResponse.json({
      ok: true,
      entryId,
      status: "pending",
      adminNotified,
      message:
        "Thank you! Your project was submitted for review. After LAF approves it, it will appear in the public gallery. We will email a digital certificate for valid entries.",
    });
  } catch (err) {
    console.error("[innovators/submit]", err);
    return jsonError("Could not submit your project. Please try again.", "server_error", 500);
  }
}
