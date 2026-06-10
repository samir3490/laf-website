import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { fetchPublicGoogleReviews } from "@/lib/google-reviews-public";
import type { GoogleReviewsMeta } from "@/lib/google-reviews";

const META_DOC = "summary";

export type SyncResult = {
  synced: number;
  total: number;
  source: string;
  placeId?: string;
  error?: string;
};

export async function syncGoogleReviewsToFirestore(): Promise<SyncResult> {
  const db = getFirebaseAdminDb();
  if (!db) {
    return {
      synced: 0,
      total: 0,
      source: "none",
      error: "FIREBASE_SERVICE_ACCOUNT_JSON is not configured on the server.",
    };
  }

  const publicData = await fetchPublicGoogleReviews();
  if (!publicData) {
    return {
      synced: 0,
      total: 0,
      source: "public_maps",
      error: "Could not load public Google Maps data for this business.",
    };
  }

  const batch = db.batch();

  for (const review of publicData.reviews) {
    const sortAt = review.publishedAt ?? review.relativeTime ?? new Date().toISOString();
    batch.set(
      db.collection("google_reviews").doc(review.id),
      { ...review, sortAt, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  const meta: GoogleReviewsMeta = {
    businessName: publicData.businessName,
    rating: publicData.rating,
    totalReviewCount: publicData.totalReviewCount,
    reviewWriteUrl: publicData.reviewWriteUrl,
    googleMapsUrl: publicData.googleMapsUrl,
    mapsEmbedUrl: publicData.mapsEmbedUrl,
    placeId: publicData.placeId,
    lastSyncedAt: new Date().toISOString(),
    syncSource: "public_maps",
  };

  batch.set(db.collection("google_reviews_meta").doc(META_DOC), meta, { merge: true });
  await batch.commit();

  return {
    synced: publicData.reviews.length,
    total: publicData.totalReviewCount ?? publicData.reviews.length,
    source: "public_maps",
    placeId: publicData.placeId,
  };
}

export { fetchPublicGoogleReviews };
