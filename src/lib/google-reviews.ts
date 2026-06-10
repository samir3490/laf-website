import googleBusiness from "@/content/google-business.json";

export type GoogleReviewRecord = {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime?: string;
  publishedAt?: string;
  source: "google_business" | "places_api" | "public_maps";
};

export type GoogleReviewsMeta = {
  businessName: string;
  rating?: number;
  totalReviewCount?: number;
  reviewWriteUrl: string;
  googleMapsUrl?: string;
  mapsEmbedUrl?: string;
  placeId?: string;
  lastSyncedAt?: string;
  syncSource?: string;
};

export function getGoogleBusinessConfig() {
  return googleBusiness as {
    businessName: string;
    address: string;
    googleShareUrl: string;
    placeId?: string;
    placeHex?: string;
    qrImage: string;
    textSearchQuery: string;
  };
}

export function reviewWriteUrl(placeId?: string): string {
  const config = getGoogleBusinessConfig();
  const shareUrl = config.googleShareUrl;
  const envPlaceId = process.env.GOOGLE_PLACE_ID?.trim();
  const id = placeId || envPlaceId || config.placeId;
  if (id) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
  }
  return shareUrl;
}

export function reviewFingerprint(review: {
  authorName: string;
  rating: number;
  text: string;
  publishedAt?: string;
}): string {
  const base = `${review.authorName}|${review.rating}|${review.text}|${review.publishedAt ?? ""}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return `r-${hash.toString(36)}`;
}
