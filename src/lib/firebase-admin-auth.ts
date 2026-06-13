import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function verifyFirebaseIdToken(req: Request): Promise<DecodedIdToken | null> {
  if (!getFirebaseAdminDb()) return null;

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    return await getAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function verifyLibraryAdminRequest(req: Request): Promise<string | null> {
  const decoded = await verifyFirebaseIdToken(req);
  return decoded?.email ?? null;
}

export function authProvider(decoded: DecodedIdToken): string | undefined {
  const firebase = decoded.firebase as { sign_in_provider?: string } | undefined;
  return firebase?.sign_in_provider;
}

export function isPhoneAuth(decoded: DecodedIdToken): boolean {
  return authProvider(decoded) === "phone" && Boolean(decoded.phone_number);
}

export function isGoogleAuth(decoded: DecodedIdToken): boolean {
  return authProvider(decoded) === "google.com";
}
