import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminStorage: Storage | undefined;

export function getFirebaseAdminDb(): Firestore | null {
  if (adminDb) return adminDb;

  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!inline) return null;

  try {
    if (!getApps().length) {
      const projectId =
        process.env.FIREBASE_PROJECT_ID ??
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
        "lata-agrawal-foundation";
      adminApp = initializeApp({
        credential: cert(JSON.parse(inline)),
        projectId,
      });
    } else {
      adminApp = getApps()[0];
    }
    adminDb = getFirestore(adminApp);
    return adminDb;
  } catch {
    return null;
  }
}

export function getFirebaseAdminStorage(): Storage | null {
  if (adminStorage) return adminStorage;
  if (!getFirebaseAdminDb()) return null;
  try {
    adminStorage = getStorage();
    return adminStorage;
  } catch {
    return null;
  }
}

export function getDrawingStorageBucketName(): string {
  return (
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ??
    "lata-agrawal-foundation.firebasestorage.app"
  );
}
