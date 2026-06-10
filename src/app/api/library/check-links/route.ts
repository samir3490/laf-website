import { NextResponse } from "next/server";
import seedResources from "@/content/library-resources.json";
import { verifyLibraryAdminRequest } from "@/lib/firebase-admin-auth";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { isLibraryAdmin } from "@/lib/library";
import { checkLibraryUrl } from "@/lib/library-link-check";
import { normalizeLibraryUrl } from "@/lib/library-url";

export const maxDuration = 60;

async function isAuthorized(req: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;

  const email = await verifyLibraryAdminRequest(req);
  return Boolean(email && isLibraryAdmin(email));
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const isCron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  const results: {
    slug: string;
    url: string;
    ok: boolean;
    status: number;
    source: "seed" | "firestore";
  }[] = [];

  const seen = new Set<string>();

  for (const item of seedResources as { slug: string; url: string }[]) {
    const url = normalizeLibraryUrl(item.url) ?? item.url;
    const { ok, status } = await checkLibraryUrl(url);
    results.push({ slug: item.slug, url, ok, status, source: "seed" });
    seen.add(item.slug);
  }

  const adminDb = getFirebaseAdminDb();
  if (adminDb) {
    const snap = await adminDb.collection("library_resources").get();
    for (const doc of snap.docs) {
      const data = doc.data();
      const slug = String(data.slug ?? doc.id);
      if (seen.has(slug)) continue;

      const url = String(data.url ?? "");
      if (!url) continue;

      const { ok, status } = await checkLibraryUrl(url);
      results.push({ slug, url, ok, status, source: "firestore" });

      if (isCron) {
        await doc.ref.update({
          linkStatus: ok ? "ok" : "broken",
          linkCheckedAt: new Date().toISOString(),
        });
      }
    }
  }

  const broken = results.filter((r) => !r.ok);

  return NextResponse.json({
    checked: results.length,
    broken: broken.length,
    brokenLinks: broken,
    firestoreChecked: Boolean(adminDb),
    checkedAt: new Date().toISOString(),
  });
}
