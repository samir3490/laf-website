import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { DRAWING_ENTRIES_COLLECTION, isDrawingAdmin } from "@/lib/drawing";
import { getDrawingStorageBucketName, getFirebaseAdminDb, getFirebaseAdminStorage } from "@/lib/firebase-admin";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";
import { trashGoogleDriveFile } from "@/lib/google-drive-upload";

export async function POST(req: Request) {
  try {
    const email = await verifyLibraryAdminRequest(req);
    if (!email || !isDrawingAdmin(email)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const entryId = typeof body.entryId === "string" ? body.entryId.trim() : "";
    const deleteImage = body.deleteImage !== false;

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID is required." }, { status: 400 });
    }

    const adminDb = getFirebaseAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const entryRef = adminDb.collection(DRAWING_ENTRIES_COLLECTION).doc(entryId);
    const entrySnap = await entryRef.get();
    if (!entrySnap.exists) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    const data = entrySnap.data()!;
    const driveFileId = typeof data.driveFileId === "string" ? data.driveFileId : "";
    const imagePath = typeof data.imagePath === "string" ? data.imagePath : "";

    await entryRef.update({
      status: "removed",
      removedAt: FieldValue.serverTimestamp(),
      removedBy: email,
    });

    if (deleteImage) {
      if (driveFileId) {
        await trashGoogleDriveFile(driveFileId);
      } else if (imagePath) {
        const storage = getFirebaseAdminStorage();
        if (storage) {
          try {
            await storage.bucket(getDrawingStorageBucketName()).file(imagePath).delete({ ignoreNotFound: true });
          } catch {
            // Entry marked removed even if storage delete fails
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[drawing/admin/remove]", err);
    return NextResponse.json({ error: "Remove failed." }, { status: 500 });
  }
}
