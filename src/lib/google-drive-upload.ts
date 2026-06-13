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

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: dataUrl, fileName, mimeType }),
  });

  const text = await res.text();
  let result: { success?: boolean; url?: string; fileId?: string; fileName?: string; error?: string };
  try {
    result = JSON.parse(text) as typeof result;
  } catch {
    throw new Error(`Upload API returned invalid JSON: ${text.slice(0, 200)}`);
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
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", fileId, secret }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
