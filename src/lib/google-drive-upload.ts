export type GoogleDriveUploadResult = {
  url: string;
  fileId: string;
  fileName: string;
};

/** Web App URL from deployed `google-apps-script-drawing.js` (or shared LAF upload script). */
export function getGoogleDriveUploadApiUrl(): string | null {
  return (
    process.env.DRAWING_UPLOAD_API_URL?.trim() ||
    process.env.GOOGLE_DRIVE_UPLOAD_API_URL?.trim() ||
    process.env.UPLOAD_API_URL?.trim() ||
    null
  );
}

/**
 * Google Apps Script web apps: POST runs doPost, then Google responds with a 302 to a
 * googleusercontent URL that serves the JSON via GET. Re-POSTing that URL returns 405.
 */
async function postJsonToAppsScript(
  uploadUrl: string,
  payload: Record<string, unknown>
): Promise<Response> {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };

  const first = await fetch(uploadUrl, {
    method: "POST",
    headers,
    body,
    redirect: "manual",
  });

  if (first.status >= 300 && first.status < 400) {
    const location = first.headers.get("location");
    if (!location) {
      throw new Error("Upload service redirected without a destination URL.");
    }
    return fetch(location, {
      method: "GET",
      redirect: "follow",
    });
  }

  return first;
}

export async function uploadBufferToGoogleDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<GoogleDriveUploadResult> {
  const uploadUrl = getGoogleDriveUploadApiUrl();
  if (!uploadUrl) {
    throw new Error(
      "Google Drive upload is not configured. Set DRAWING_UPLOAD_API_URL on the server."
    );
  }

  // Keep payloads under typical Apps Script / proxy limits (~few MB base64).
  if (buffer.length > 3.5 * 1024 * 1024) {
    throw new Error(
      "Photo is too large after processing. Please use a smaller photo (under about 3 MB)."
    );
  }

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const res = await postJsonToAppsScript(uploadUrl, {
    file: dataUrl,
    fileName,
    mimeType,
  });

  const text = await res.text();
  let result: { success?: boolean; url?: string; fileId?: string; fileName?: string; error?: string };
  try {
    result = JSON.parse(text) as typeof result;
  } catch {
    throw new Error(
      `Upload service returned an unexpected response (${res.status}). Please try again in a minute.`
    );
  }

  if (!result.success || !result.url || !result.fileId) {
    throw new Error(result.error || "Google Drive upload failed.");
  }

  return {
    url: result.url,
    fileId: result.fileId,
    fileName: result.fileName || fileName,
  };
}

/** Moves a Drive file to trash when delete action is enabled on the Apps Script deployment. */
export async function trashGoogleDriveFile(fileId: string): Promise<boolean> {
  const uploadUrl = getGoogleDriveUploadApiUrl();
  const secret = process.env.GOOGLE_DRIVE_UPLOAD_SECRET?.trim();
  if (!uploadUrl || !secret || !fileId) return false;

  try {
    const res = await postJsonToAppsScript(uploadUrl, {
      action: "delete",
      fileId,
      secret,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
