import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { notifyAdminOfInnovatorsSubmission } from "@/lib/innovators-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";
import {
  INNOVATORS_ENTRIES_COLLECTION,
  isAllowedDriveOrVideoUrl,
  isAllowedVideoLink,
  isValidInnovatorsEmail,
  isYoungInnovatorsOpen,
  normalizeIndiaPhone,
  normalizeInnovatorsEmail,
  YOUNG_INNOVATORS_AGE,
} from "@/lib/young-innovators";

export const maxDuration = 60;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function ipHash(ip: string): string {
  return createHash("sha256").update(`innovators:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(req: Request) {
  try {
    if (!isYoungInnovatorsOpen()) {
      return NextResponse.json(
        { error: "Submissions are closed for this challenge. Please check back for the next event." },
        { status: 403 }
      );
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`innovators-submit:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Daily submission limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const turnstileError = requireTurnstileInProduction();
    if (turnstileError) {
      return NextResponse.json({ error: turnstileError }, { status: 503 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Honeypot — bots fill this; humans never see it
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true, entryId: "ok" });
    }

    if (isTurnstileEnabled()) {
      const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
      const valid = await verifyTurnstileToken(token, ip);
      if (!valid) {
        return NextResponse.json(
          { error: "Please complete the captcha and try again." },
          { status: 403 }
        );
      }
    }

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const childName = String(body.childName ?? "").trim();
    const parentName = String(body.parentName ?? "").trim();
    const parentEmailRaw = String(body.parentEmail ?? "").trim();
    const parentPhoneRaw = String(body.parentPhone ?? "").trim();
    const childCity = String(body.childCity ?? "").trim();
    const childSchool = String(body.childSchool ?? "").trim();
    const ageRaw = String(body.childAge ?? "").trim();
    const photo1Url = String(body.photo1Url ?? "").trim();
    const photo2Url = String(body.photo2Url ?? "").trim();
    const videoUrl = String(body.videoUrl ?? "").trim();
    const photo1FileId = String(body.photo1FileId ?? "").trim();
    const photo2FileId = String(body.photo2FileId ?? "").trim();
    const termsAccepted = body.termsAccepted === true;

    if (!title || title.length > 120) {
      return NextResponse.json({ error: "Please enter a project title (max 120 characters)." }, { status: 400 });
    }
    if (!description || description.length < 20 || description.length > 2000) {
      return NextResponse.json(
        { error: "Please describe the project in 20–2000 characters (materials used and how it works)." },
        { status: 400 }
      );
    }
    if (!childName || childName.length > 40) {
      return NextResponse.json(
        { error: "Please enter the child's first name only (max 40 characters)." },
        { status: 400 }
      );
    }
    if (!parentName || parentName.length > 80) {
      return NextResponse.json({ error: "Please enter parent / guardian name." }, { status: 400 });
    }
    const parentEmail = normalizeInnovatorsEmail(parentEmailRaw);
    if (!parentEmail || !isValidInnovatorsEmail(parentEmail) || parentEmail.length > 120) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const parentPhone = normalizeIndiaPhone(parentPhoneRaw);
    if (!parentPhone) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }
    if (!childCity || childCity.length > 80) {
      return NextResponse.json({ error: "Please enter your city." }, { status: 400 });
    }
    if (childSchool.length > 120) {
      return NextResponse.json({ error: "School name is too long." }, { status: 400 });
    }

    const age = parseInt(ageRaw, 10);
    if (
      !Number.isFinite(age) ||
      age < YOUNG_INNOVATORS_AGE.min ||
      age > YOUNG_INNOVATORS_AGE.max
    ) {
      return NextResponse.json(
        {
          error: `Child must be between ${YOUNG_INNOVATORS_AGE.min} and ${YOUNG_INNOVATORS_AGE.max} years old.`,
        },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "Please accept the terms to submit the project." },
        { status: 400 }
      );
    }

    if (
      !photo1Url ||
      !isAllowedDriveOrVideoUrl(photo1Url) ||
      !photo2Url ||
      !isAllowedDriveOrVideoUrl(photo2Url)
    ) {
      return NextResponse.json(
        { error: "Please upload two clear project photos." },
        { status: 400 }
      );
    }

    if (!videoUrl || !isAllowedVideoLink(videoUrl)) {
      return NextResponse.json(
        {
          error:
            "Please paste a YouTube or Google Drive link to your ~1-minute explanation video.",
        },
        { status: 400 }
      );
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Submissions are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const entryId = randomUUID();
    const doc = {
      title,
      description,
      childName,
      childAge: age,
      childCity,
      childSchool: childSchool || null,
      parentName,
      parentEmail,
      parentPhone,
      photo1Url,
      photo2Url,
      photo1FileId: photo1FileId || null,
      photo2FileId: photo2FileId || null,
      videoUrl,
      videoSource: "link",
      status: "pending",
      termsAccepted: true,
      submitterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection(INNOVATORS_ENTRIES_COLLECTION).doc(entryId).set(doc);

    void notifyAdminOfInnovatorsSubmission({
      entryId,
      title,
      childName,
      parentEmail,
      photo1Url,
      photo2Url,
      videoUrl,
    });

    return NextResponse.json({
      ok: true,
      entryId,
      message:
        "Thank you! Your project was submitted. We will review it and email a digital certificate to the parent address for valid entries.",
    });
  } catch (err) {
    console.error("[innovators/submit]", err);
    return NextResponse.json(
      { error: "Could not submit your project. Please try again." },
      { status: 500 }
    );
  }
}
