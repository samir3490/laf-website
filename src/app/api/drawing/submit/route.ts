import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  ageGroupForAge,
  DRAWING_ENTRIES_COLLECTION,
  isValidEmail,
  MAX_DRAWING_BYTES,
  MIN_DRAWING_BYTES,
  normalizeIndiaPhone,
} from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { isPhoneAuth, verifyFirebaseIdToken } from "@/lib/firebase-admin-auth";
import { uploadBufferToGoogleDrive } from "@/lib/google-drive-upload";
import { notifyAdminOfDrawingSubmission } from "@/lib/drawing-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { isTurnstileEnabled, requireTurnstileInProduction, verifyTurnstileToken } from "@/lib/turnstile";

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function ipHash(ip: string): string {
  return createHash("sha256").update(`drawing:${ip}`).digest("hex").slice(0, 16);
}

function phoneHash(phone: string): string {
  return createHash("sha256").update(`drawing-phone:${phone}`).digest("hex").slice(0, 20);
}

function detectImageMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!checkRateLimit(`drawing-submit:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Daily submission limit reached. Please try again tomorrow." },
        { status: 429 }
      );
    }

    const decoded = await verifyFirebaseIdToken(req);
    if (!decoded || !isPhoneAuth(decoded)) {
      return NextResponse.json(
        { error: "Please verify your mobile number with OTP before submitting." },
        { status: 401 }
      );
    }

    const turnstileError = requireTurnstileInProduction();
    if (turnstileError) {
      return NextResponse.json({ error: turnstileError }, { status: 503 });
    }

    const formData = await req.formData();
    const turnstileToken = formData.get("turnstileToken");
    if (isTurnstileEnabled()) {
      const token = typeof turnstileToken === "string" ? turnstileToken : "";
      const valid = await verifyTurnstileToken(token, ip);
      if (!valid) {
        return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 403 });
      }
    }

    const title = String(formData.get("title") ?? "").trim();
    const artistName = String(formData.get("artistName") ?? "").trim();
    const parentName = String(formData.get("parentName") ?? "").trim();
    const parentEmail = String(formData.get("parentEmail") ?? "").trim();
    const artistCity = String(formData.get("artistCity") ?? "").trim();
    const artistClass = String(formData.get("artistClass") ?? "").trim();
    const artistSchool = String(formData.get("artistSchool") ?? "").trim();
    const termsAccepted = formData.get("termsAccepted") === "true";
    const ageRaw = String(formData.get("artistAge") ?? "").trim();
    const file = formData.get("image");

    if (!title || title.length > 120) {
      return NextResponse.json({ error: "Please enter a title (max 120 characters)." }, { status: 400 });
    }
    if (!artistName || artistName.length > 40) {
      return NextResponse.json(
        { error: "Please enter the child's first name only (max 40 characters)." },
        { status: 400 }
      );
    }
    if (!parentName || parentName.length > 80) {
      return NextResponse.json({ error: "Please enter parent / guardian name." }, { status: 400 });
    }
    if (!parentEmail || !isValidEmail(parentEmail) || parentEmail.length > 120) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!artistClass || artistClass.length > 20) {
      return NextResponse.json({ error: "Please enter a class or grade." }, { status: 400 });
    }
    if (artistSchool && artistSchool.length > 100) {
      return NextResponse.json({ error: "School name must be at most 100 characters." }, { status: 400 });
    }
    if (!artistCity || artistCity.length > 80) {
      return NextResponse.json({ error: "Please enter a city." }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "Please confirm the artwork is your original work." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
    }

    let artistAge: number;
    if (ageRaw) {
      const age = Number.parseInt(ageRaw, 10);
      if (!Number.isFinite(age) || age < 1 || age > 18) {
        return NextResponse.json({ error: "Please enter a valid age (1–18)." }, { status: 400 });
      }
      artistAge = age;
    } else {
      return NextResponse.json({ error: "Please enter an age." }, { status: 400 });
    }

    const parentPhone = normalizeIndiaPhone(decoded.phone_number ?? "");
    if (!parentPhone) {
      return NextResponse.json({ error: "Verified phone number is invalid." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_DRAWING_BYTES) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
    }
    if (buffer.length < MIN_DRAWING_BYTES) {
      return NextResponse.json({ error: "Image file is too small." }, { status: 400 });
    }

    const mime = detectImageMime(buffer);
    if (!mime || !ALLOWED_MIME[mime]) {
      return NextResponse.json({ error: "Please upload a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json(
        { error: "Submissions are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const submitterUid = decoded.uid;
    const existingSnap = await adminDb
      .collection(DRAWING_ENTRIES_COLLECTION)
      .where("submitterUid", "==", submitterUid)
      .get();
    const activeCount = existingSnap.docs.filter((d) => {
      const s = d.data().status;
      return s === "pending" || s === "active";
    }).length;
    if (activeCount >= 3) {
      return NextResponse.json(
        { error: "This mobile number already has the maximum number of entries for this competition." },
        { status: 429 }
      );
    }

    const entryId = randomUUID();
    const ext = ALLOWED_MIME[mime];
    const fileName = `drawing-${entryId}.${ext}`;

    const driveUpload = await uploadBufferToGoogleDrive(buffer, fileName, mime);

    await adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId).set({
      title,
      artistName,
      artistAge,
      ageGroup: ageGroupForAge(artistAge),
      artistClass,
      artistSchool,
      artistCity,
      parentName,
      parentEmail,
      parentPhone,
      submitterPhoneHash: phoneHash(parentPhone),
      submitterUid,
      imageUrl: driveUpload.url,
      driveFileId: driveUpload.fileId,
      voteCount: 0,
      status: "pending",
      submitterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    void notifyAdminOfDrawingSubmission({
      entryId,
      title,
      artistName,
      imageUrl: driveUpload.url,
    });

    return NextResponse.json({
      ok: true,
      entryId,
      pending: true,
      message:
        "Thank you! Your artwork was received and is pending LAF review before it appears in the gallery.",
    });
  } catch (err) {
    console.error("[drawing/submit]", err);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
