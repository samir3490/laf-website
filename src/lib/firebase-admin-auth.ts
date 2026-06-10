import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function verifyLibraryAdminRequest(req: Request): Promise<string | null> {
  if (!getFirebaseAdminDb()) return null;

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.email ?? null;
  } catch {
    return null;
  }
}
