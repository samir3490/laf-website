import type { DrawingEntry } from "@/lib/drawing";

/** Extract Google Drive file id from stored imageUrl, if present. */
export function driveFileIdFromImageUrl(imageUrl: string): string | null {
  if (!imageUrl) return null;
  const idParam = imageUrl.match(/[?&]id=([^&]+)/)?.[1];
  if (idParam) return decodeURIComponent(idParam);
  const dPath = imageUrl.match(/\/d\/([^/]+)/)?.[1];
  if (dPath) return decodeURIComponent(dPath);
  return null;
}

/** Public URL served by our image proxy (reliable for Drive-hosted artwork). */
export function drawingImageSrc(entry: Pick<DrawingEntry, "imageUrl" | "driveFileId">): string {
  const fileId = entry.driveFileId?.trim() || driveFileIdFromImageUrl(entry.imageUrl);
  if (fileId) return `/api/drawing/image?fileId=${encodeURIComponent(fileId)}`;
  return entry.imageUrl;
}

/** Direct Drive thumbnail URL for server-side fetch. */
export function driveThumbnailUrl(fileId: string, width = 1600): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width}`;
}
