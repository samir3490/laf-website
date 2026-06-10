import { NextResponse } from "next/server";
import seedResources from "@/content/library-resources.json";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { checkLibraryUrl } from "@/lib/library-link-check";
import { normalizeLibraryUrl } from "@/lib/library-url";

const rateMap = new Map<string, number>();

export const maxDuration = 60;

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const isCron = Boolean(cronSecret && auth === `Bearer ${cronSecret}`);

  if (!isCron) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const count = rateMap.get(ip) ?? 0;
    if (count >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }
    rateMap.set(ip, count + 1);
  }

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

  const adminDb = isCron ? getFirebaseAdminDb() : null;
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
