import { doc, serverTimestamp, writeBatch, type Firestore } from "firebase/firestore";
import seedResources from "@/content/library-resources.json";
import { LIBRARY_RESOURCES_COLLECTION } from "@/lib/firebase";
import { normalizeLibraryUrl } from "@/lib/library-url";

export async function seedLibraryResources(db: Firestore): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;

  for (const item of seedResources as Record<string, unknown>[]) {
    const slug = String(item.slug ?? "");
    const url = String(item.url ?? "");
    if (!slug || !url) continue;

    batch.set(doc(db, LIBRARY_RESOURCES_COLLECTION, slug), {
      ...item,
      urlNormalized: normalizeLibraryUrl(url) ?? url,
      status: "approved",
      visitCount: 0,
      reportCount: 0,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    count++;
  }

  await batch.commit();
  return count;
}
