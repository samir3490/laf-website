import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

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
