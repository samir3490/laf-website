import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getGoogleDriveUploadApiUrl, uploadBufferToGoogleDrive } from "@/lib/google-drive-upload";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import {
  INNOVATORS_PHOTO_MIME,
  isYoungInnovatorsOpen,
  MAX_INNOVATORS_PHOTO_BYTES,
} from "@/lib/young-innovators";

export const maxDuration = 60;

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

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

/** Upload one project photo to LAF Google Drive (same Apps Script as drawing competition). */
export async function POST(req: Request) {
  try {
    if (!isYoungInnovatorsOpen()) {
      return NextResponse.json({ error: "Submissions are closed for this challenge." }, { status: 403 });
    }

    if (!getGoogleDriveUploadApiUrl()) {
      return NextResponse.json(
        { error: "Google Drive upload is not configured. Please contact LAF." },
        { status: 503 }
      );
    }

    const ip = clientIp(req);
    if (!checkRateLimit(`innovators-upload:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const slot = String(formData.get("slot") ?? "photo").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose a photo file." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_INNOVATORS_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 5 MB or smaller. Try a smaller image from your phone." },
        { status: 400 }
      );
    }
    if (buffer.length < 1024) {
      return NextResponse.json({ error: "Photo file is too small." }, { status: 400 });
    }

    const mime = detectImageMime(buffer);
    if (!mime || !INNOVATORS_PHOTO_MIME[mime]) {
      return NextResponse.json({ error: "Please upload a JPEG, PNG, or WebP photo." }, { status: 400 });
    }

    const ext = INNOVATORS_PHOTO_MIME[mime];
    const safeSlot = slot === "photo2" ? "photo2" : "photo1";
    const fileName = `innovators-${safeSlot}-${randomUUID()}.${ext}`;
    const drive = await uploadBufferToGoogleDrive(buffer, fileName, mime);

    return NextResponse.json({
      ok: true,
      url: drive.url,
      fileId: drive.fileId,
      fileName: drive.fileName,
    });
  } catch (err) {
    console.error("[innovators/upload]", err);
    const message =
      err instanceof Error && err.message && !err.message.includes("not configured")
        ? err.message
        : "Could not upload photo to Google Drive. Please try a smaller JPG/PNG and try again.";
    const status =
      err instanceof Error && err.message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
