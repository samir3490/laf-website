import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  ageGroupForAge,
  DRAWING_ENTRIES_COLLECTION,
  isValidEmail,
  MAX_DRAWING_BYTES,
  MIN_DRAWING_BYTES,
  normalizeEmail,
} from "@/lib/drawing";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  countActiveEntriesForEmail,
  emailDocId,
  verifyDrawingEmailSession,
} from "@/lib/drawing-email-otp";
import { uploadBufferToGoogleDrive } from "@/lib/google-drive-upload";
import { moderateDrawingImage, shouldAutoPublishEntry } from "@/lib/drawing-moderation";
import { notifyAdminOfDrawingSubmission } from "@/lib/drawing-notify";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

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

function getVerifyToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return null;
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

    const verifyToken = getVerifyToken(req);
    if (!verifyToken) {
      return NextResponse.json(
        { error: "Please verify your email with the one-time code before submitting." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
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

    const session = await verifyDrawingEmailSession(verifyToken, parentEmail);
    if (!session) {
      return NextResponse.json(
        { error: "Email verification expired or does not match. Please verify your email again." },
        { status: 401 }
      );
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

    const normalizedEmail = normalizeEmail(parentEmail);
    const submitterEmailHash = emailDocId(normalizedEmail);
    const activeCount = await countActiveEntriesForEmail(normalizedEmail);
    if (activeCount >= 3) {
      return NextResponse.json(
        { error: "This email already has the maximum number of entries for this competition." },
        { status: 429 }
      );
    }

    const entryId = randomUUID();
    const ext = ALLOWED_MIME[mime];
    const fileName = `drawing-${entryId}.${ext}`;

    const driveUpload = await uploadBufferToGoogleDrive(buffer, fileName, mime);

    const moderation = await moderateDrawingImage(buffer, mime);
    const autoPublished = shouldAutoPublishEntry(moderation);
    const status = autoPublished ? "active" : "pending";

    await adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId).set({
      title,
      artistName,
      artistAge,
      ageGroup: ageGroupForAge(artistAge),
      artistClass,
      artistSchool,
      artistCity,
      parentName,
      parentEmail: normalizedEmail,
      submitterEmailHash,
      submitterUid: submitterEmailHash,
      imageUrl: driveUpload.url,
      driveFileId: driveUpload.fileId,
      voteCount: 0,
      status,
      ...(moderation
        ? {
            aiModeration: {
              approved: moderation.approved,
              confidence: moderation.confidence,
              reason: moderation.reason,
              model: moderation.model ?? null,
              at: new Date().toISOString(),
            },
          }
        : {}),
      submitterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    if (!autoPublished) {
      void notifyAdminOfDrawingSubmission({
        entryId,
        title,
        artistName,
        imageUrl: driveUpload.url,
      });
    }

    return NextResponse.json({
      ok: true,
      entryId,
      pending: !autoPublished,
      published: autoPublished,
      message: autoPublished
        ? "Thank you! Your artwork is now live in the gallery. Sign in with Google to vote."
        : "Thank you! Your artwork was received and is pending LAF review before it appears in the gallery.",
    });
  } catch (err) {
    console.error("[drawing/submit]", err);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
