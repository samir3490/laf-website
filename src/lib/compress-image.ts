/** Client-side resize/compress so phone photos upload reliably to Google Drive. */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;
/** Stay under Vercel + Apps Script practical limits after base64. */
export const TARGET_MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Please try a JPG or PNG photo."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not compress photo."));
        else resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Resize long edge and encode as JPEG. Falls back to original file if compression is not helpful.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error("Please choose a photo (JPG, PNG, or WebP).");
  }

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    let quality = JPEG_QUALITY;
    let blob = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob.size > TARGET_MAX_UPLOAD_BYTES && quality > 0.45) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }

    if (blob.size >= file.size && file.type === "image/jpeg" && file.size <= TARGET_MAX_UPLOAD_BYTES) {
      return file;
    }

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    if (file.size > TARGET_MAX_UPLOAD_BYTES) {
      throw new Error("Photo is too large. Please choose a smaller JPG or PNG (under 3 MB).");
    }
    return file;
  }
}
