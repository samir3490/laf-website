import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  getGoogleBusinessConfig,
  reviewFingerprint,
  reviewWriteUrl,
  type GoogleReviewRecord,
  type GoogleReviewsMeta,
} from "@/lib/google-reviews";

const META_DOC = "summary";

function getPlacesApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;
}

type SyncResult = {
  synced: number;
  total: number;
  source: string;
  placeId?: string;
  error?: string;
};

async function refreshGoogleAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.access_token === "string" ? data.access_token : null;
}

function starRatingToNumber(starRating?: string): number {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return map[starRating ?? ""] ?? 0;
}

async function fetchBusinessProfileReviews(): Promise<{
  reviews: GoogleReviewRecord[];
  rating?: number;
  totalReviewCount?: number;
} | null> {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
  if (!accountId || !locationId) return null;

  const accessToken = await refreshGoogleAccessToken();
  if (!accessToken) return null;

  const reviews: GoogleReviewRecord[] = [];
  let pageToken = "";
  let averageRating: number | undefined;
  let totalReviewCount: number | undefined;

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`
    );
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    averageRating = data.averageRating ?? averageRating;
    totalReviewCount = data.totalReviewCount ?? totalReviewCount;

    for (const item of data.reviews ?? []) {
      const text = String(item.comment ?? "").trim();
      const authorName = String(item.reviewer?.displayName ?? "Google user");
      const publishedAt = item.createTime ?? item.updateTime;
      const rating = starRatingToNumber(item.starRating);
      if (rating < 1) continue;

      const record: GoogleReviewRecord = {
        id: String(item.reviewId ?? reviewFingerprint({ authorName, rating, text, publishedAt })),
        authorName,
        authorPhotoUrl: item.reviewer?.profilePhotoUrl,
        rating,
        text,
        relativeTime: item.reviewReply?.updateTime ? undefined : undefined,
        publishedAt,
        source: "google_business",
      };
      reviews.push(record);
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return { reviews, rating: averageRating, totalReviewCount };
}

async function findPlaceId(apiKey: string): Promise<string | null> {
  const configured = process.env.GOOGLE_PLACE_ID?.trim();
  if (configured) return configured;

  const { textSearchQuery } = getGoogleBusinessConfig();
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: textSearchQuery }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const place = data.places?.[0];
  return place?.id ? String(place.id) : null;
}

async function fetchPlacesApiReviews(apiKey: string): Promise<{
  reviews: GoogleReviewRecord[];
  rating?: number;
  totalReviewCount?: number;
  placeId?: string;
  googleMapsUri?: string;
} | null> {
  const placeId = await findPlaceId(apiKey);
  if (!placeId) return null;

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();

  const reviews: GoogleReviewRecord[] = (data.reviews ?? []).map(
    (item: {
      name?: string;
      authorAttribution?: { displayName?: string; photoUri?: string };
      rating?: number;
      text?: { text?: string };
      relativePublishTimeDescription?: string;
      publishTime?: string;
    }) => {
      const authorName = String(item.authorAttribution?.displayName ?? "Google user");
      const text = String(item.text?.text ?? "").trim();
      const rating = Number(item.rating ?? 0);
      const publishedAt = item.publishTime;
      return {
        id: String(
          item.name?.split("/").pop() ??
            reviewFingerprint({ authorName, rating, text, publishedAt })
        ),
        authorName,
        authorPhotoUrl: item.authorAttribution?.photoUri,
        rating,
        text,
        relativeTime: item.relativePublishTimeDescription,
        publishedAt,
        source: "places_api" as const,
      };
    }
  );

  return {
    reviews: reviews.filter((r) => r.rating >= 1),
    rating: data.rating,
    totalReviewCount: data.userRatingCount,
    placeId,
    googleMapsUri: data.googleMapsUri,
  };
}

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

  let payload: {
    reviews: GoogleReviewRecord[];
    rating?: number;
    totalReviewCount?: number;
    placeId?: string;
    googleMapsUri?: string;
  } | null = null;
  let source = "google_business";

  payload = await fetchBusinessProfileReviews();
  if (!payload) {
    source = "places_api";
    const apiKey = getPlacesApiKey();
    if (!apiKey) {
      return {
        synced: 0,
        total: 0,
        source: "none",
        error:
          "Configure GOOGLE_BUSINESS_* OAuth vars (all reviews) or GOOGLE_PLACES_API_KEY (latest 5 reviews).",
      };
    }
    payload = await fetchPlacesApiReviews(apiKey);
  }

  if (!payload || payload.reviews.length === 0) {
    return {
      synced: 0,
      total: 0,
      source,
      error: "No reviews returned. Check Google API credentials and business profile access.",
    };
  }

  const batch = db.batch();
  for (const review of payload.reviews) {
    const sortAt = review.publishedAt ?? new Date().toISOString();
    batch.set(
      db.collection("google_reviews").doc(review.id),
      {
        ...review,
        sortAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  const config = getGoogleBusinessConfig();
  const placeId = payload.placeId ?? process.env.GOOGLE_PLACE_ID;
  const meta: GoogleReviewsMeta = {
    businessName: config.businessName,
    rating: payload.rating,
    totalReviewCount: payload.totalReviewCount ?? payload.reviews.length,
    reviewWriteUrl: reviewWriteUrl(placeId),
    googleMapsUrl: payload.googleMapsUri ?? config.googleShareUrl,
    placeId,
    lastSyncedAt: new Date().toISOString(),
    syncSource: source,
  };

  batch.set(db.collection("google_reviews_meta").doc(META_DOC), meta, { merge: true });
  await batch.commit();

  return {
    synced: payload.reviews.length,
    total: payload.totalReviewCount ?? payload.reviews.length,
    source,
    placeId,
  };
}
