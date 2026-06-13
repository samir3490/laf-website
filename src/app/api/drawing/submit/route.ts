import { createHash, randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  DRAWING_ENTRIES_COLLECTION,
  MAX_DRAWING_BYTES,
  MIN_DRAWING_BYTES,
} from "@/lib/drawing";
import { getDrawingStorageBucketName, getFirebaseAdminDb, getFirebaseAdminStorage } from "@/lib/firebase-admin";
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
    const artistCity = String(formData.get("artistCity") ?? "").trim();
    const termsAccepted = formData.get("termsAccepted") === "true";
    const ageRaw = String(formData.get("artistAge") ?? "").trim();
    const file = formData.get("image");

    if (!title || title.length > 120) {
      return NextResponse.json({ error: "Please enter a title (max 120 characters)." }, { status: 400 });
    }
    if (!artistName || artistName.length > 80) {
      return NextResponse.json({ error: "Please enter your name (max 80 characters)." }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "Please confirm the artwork is your original work." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an image file." }, { status: 400 });
    }

    let artistAge: number | undefined;
    if (ageRaw) {
      const age = Number.parseInt(ageRaw, 10);
      if (!Number.isFinite(age) || age < 1 || age > 120) {
        return NextResponse.json({ error: "Please enter a valid age." }, { status: 400 });
      }
      artistAge = age;
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
    const storage = getFirebaseAdminStorage();
    if (!adminDb || !storage) {
      return NextResponse.json(
        { error: "Submissions are temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const entryId = randomUUID();
    const ext = ALLOWED_MIME[mime];
    const imagePath = `drawings/${entryId}.${ext}`;
    const bucket = storage.bucket(getDrawingStorageBucketName());
    const storageFile = bucket.file(imagePath);

    await storageFile.save(buffer, {
      metadata: {
        contentType: mime,
        cacheControl: "public, max-age=31536000",
      },
    });
    await storageFile.makePublic();

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;

    await adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId).set({
      title,
      artistName,
      artistAge: artistAge ?? null,
      artistCity: artistCity || null,
      imageUrl,
      imagePath,
      voteCount: 0,
      status: "active",
      submitterIpHash: ipHash(ip),
      createdAt: FieldValue.serverTimestamp(),
    });

    void notifyAdminOfDrawingSubmission({ entryId, title, artistName, imageUrl });

    return NextResponse.json({
      ok: true,
      entryId,
      imageUrl,
    });
  } catch (err) {
    console.error("[drawing/submit]", err);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
