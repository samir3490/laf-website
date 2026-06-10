import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { checkLibraryUrl } from "@/lib/library-link-check";
import { fetchPageMetadata } from "@/lib/library-url";

export const maxDuration = 60;

const BATCH_SIZE = 20;

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = getFirebaseAdminDb();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "FIREBASE_SERVICE_ACCOUNT_JSON is not configured. Add it to Vercel for automated metadata refresh.",
      },
      { status: 503 }
    );
  }

  const settingsRef = db.collection("library_settings").doc("metadata_refresh");
  const settingsSnap = await settingsRef.get();
  const lastSlug = settingsSnap.exists ? String(settingsSnap.data()?.lastSlug ?? "") : "";

  const snap = await db.collection("library_resources").orderBy("slug").get();
  const resources = snap.docs.map((d) => ({
    id: d.id,
    slug: String(d.data().slug ?? d.id),
    url: String(d.data().url ?? ""),
    title: String(d.data().title ?? ""),
    description: String(d.data().description ?? ""),
  }));

  if (resources.length === 0) {
    return NextResponse.json({ refreshed: 0, message: "No resources in Firestore." });
  }

  let startIndex = 0;
  if (lastSlug) {
    const idx = resources.findIndex((r) => r.slug === lastSlug);
    startIndex = idx >= 0 ? idx + 1 : 0;
  }
  if (startIndex >= resources.length) startIndex = 0;

  const batch = resources.slice(startIndex, startIndex + BATCH_SIZE);
  const results: {
    slug: string;
    updated: boolean;
    linkOk: boolean;
    error?: string;
  }[] = [];

  for (const resource of batch) {
    if (!resource.url) {
      results.push({ slug: resource.slug, updated: false, linkOk: false, error: "missing url" });
      continue;
    }

    try {
      const link = await checkLibraryUrl(resource.url);
      const meta = link.ok ? await fetchPageMetadata(resource.url) : null;

      const updates: Record<string, unknown> = {
        linkStatus: link.ok ? "ok" : "broken",
        linkCheckedAt: new Date().toISOString(),
        metadataRefreshedAt: FieldValue.serverTimestamp(),
      };

      let updated = false;
      if (meta) {
        if (meta.title && meta.title !== resource.title) {
          updates.title = meta.title;
          updated = true;
        }
        if (meta.description && meta.description !== resource.description) {
          updates.description = meta.description;
          updated = true;
        }
        if (meta.ogImage) updates.ogImage = meta.ogImage;
        if (meta.favicon) updates.favicon = meta.favicon;
        updated = true;
      }

      await db.collection("library_resources").doc(resource.id).update(updates);
      results.push({ slug: resource.slug, updated, linkOk: link.ok });
    } catch {
      results.push({ slug: resource.slug, updated: false, linkOk: false, error: "fetch failed" });
    }
  }

  const lastProcessed = batch[batch.length - 1]?.slug ?? "";
  const nextStart = startIndex + batch.length;
  const wrapped = nextStart >= resources.length;

  await settingsRef.set(
    {
      lastSlug: wrapped ? "" : lastProcessed,
      lastRunAt: FieldValue.serverTimestamp(),
      totalResources: resources.length,
      lastBatchSize: batch.length,
    },
    { merge: true }
  );

  return NextResponse.json({
    processed: batch.length,
    startIndex,
    wrapped,
    nextStartsAt: wrapped ? resources[0]?.slug : lastProcessed,
    results,
    refreshedAt: new Date().toISOString(),
  });
}
