/**
 * Google Apps Script — Drawing competition uploads to Google Drive
 *
 * SETUP:
 * 1. script.google.com → New project → paste this file
 * 2. Set ROOT_FOLDER_ID to your LAF Drive folder (shared with your Google account)
 * 3. Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * 4. Copy the Web App URL to Vercel as DRAWING_UPLOAD_API_URL
 * 5. Optional: set DELETE_SECRET below and GOOGLE_DRIVE_UPLOAD_SECRET in Vercel (admin trash)
 */

const ROOT_FOLDER_ID = "1v-V-Q6PFp_qhZO3iw_XUtyDAurG7I8od";
const DRAWING_SUBFOLDER = "Drawing Competition";
const DELETE_SECRET = ""; // e.g. random string — must match GOOGLE_DRIVE_UPLOAD_SECRET on Vercel

function parseBase64Payload(imageOrFile) {
  if (!imageOrFile) return null;
  const dataUrlMatch = String(imageOrFile).match(/^data:([^;]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return { mimeType: dataUrlMatch[1], base64: dataUrlMatch[2] };
  }
  if (/^[A-Za-z0-9+/=\s]+$/.test(String(imageOrFile).trim())) {
    return { mimeType: null, base64: String(imageOrFile).trim() };
  }
  return null;
}

function getDrawingFolder() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const existing = root.getFoldersByName(DRAWING_SUBFOLDER);
  if (existing.hasNext()) return existing.next();
  return root.createFolder(DRAWING_SUBFOLDER);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "delete") {
      if (!DELETE_SECRET || data.secret !== DELETE_SECRET) {
        return ContentService.createTextOutput(
          JSON.stringify({ success: false, error: "Unauthorized delete" })
        ).setMimeType(ContentService.MimeType.JSON);
      }
      DriveApp.getFileById(String(data.fileId)).setTrashed(true);
      return ContentService.createTextOutput(
        JSON.stringify({ success: true })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const payload = parseBase64Payload(data.file || data.image);
    const fileName = data.fileName || "drawing_" + Date.now();
    const mimeType =
      data.mimeType || (payload && payload.mimeType) || "application/octet-stream";

    if (!payload) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: "Invalid file data" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const blob = Utilities.newBlob(
      Utilities.base64Decode(payload.base64),
      mimeType,
      fileName
    );

    const folder = getDrawingFolder();
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const directUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        fileId: fileId,
        url: directUrl,
        fileName: fileName,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "LAF drawing upload API is running" })
  ).setMimeType(ContentService.MimeType.JSON);
}
