import {
  getGoogleBusinessConfig,
  reviewFingerprint,
  type GoogleReviewRecord,
} from "@/lib/google-reviews";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type PublicGooglePlace = {
  placeId: string;
  placeHex?: string;
  businessName: string;
  rating?: number;
  totalReviewCount?: number;
  mapsEmbedUrl: string;
  reviewWriteUrl: string;
  googleMapsUrl: string;
  reviews: GoogleReviewRecord[];
};

function stripXssi(text: string): string {
  return text.replace(/^\)\]\}'\n?/, "");
}

async function resolvePlaceIdFromSearch(query: string): Promise<string | null> {
  const config = getGoogleBusinessConfig();
  if (config.placeId) return config.placeId;

  const res = await fetch(
    `https://www.google.com/search?tbm=map&q=${encodeURIComponent(query)}`,
    {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/ChI[a-zA-Z0-9_-]{10,}/);
  return match?.[0] ?? null;
}

async function fetchPlacePreview(placeId: string): Promise<{
  rating?: number;
  placeHex?: string;
  businessName?: string;
  embedPb?: string;
} | null> {
  const pageRes = await fetch(
    `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`,
    {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!pageRes.ok) return null;

  const html = await pageRes.text();
  const pbMatch = html.match(/\/maps\/preview\/place\?[^"'\\]+pb=([^"'\\]+)/);
  if (!pbMatch) return null;

  const pb = decodeURIComponent(pbMatch[1].replace(/\\u003d/g, "="));
  const previewRes = await fetch(
    `https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=in&pb=${encodeURIComponent(pb)}`,
    {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!previewRes.ok) return null;

  const data = JSON.parse(stripXssi(await previewRes.text()));
  const flat = JSON.stringify(data);

  const ratingMatch = flat.match(/null,null,null,null,null,null,null,(\d)\]/);
  const rating = ratingMatch ? Number(ratingMatch[1]) : undefined;
  const hexMatch = flat.match(/(0x[a-f0-9]+:0x[a-f0-9]+)/i);
  const nameMatch = flat.match(/","(Lata Agrawal Foundation)"/);

  return {
    rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
    placeHex: hexMatch?.[1],
    businessName: nameMatch?.[1],
    embedPb: pb,
  };
}

function parseReviewsFromPreview(data: unknown): GoogleReviewRecord[] {
  const reviews: GoogleReviewRecord[] = [];

  function walk(node: unknown, depth = 0): void {
    if (depth > 20 || !Array.isArray(node)) return;

    if (
      node.length >= 4 &&
      typeof node[0] === "string" &&
      /^[\p{L}\p{M}\s'.-]{2,50}$/u.test(node[0]) &&
      typeof node[2] === "number" &&
      node[2] >= 1 &&
      node[2] <= 5 &&
      typeof node[3] === "string" &&
      node[3].length >= 20 &&
      !/^(Rate and review|Share details|http|www\.)/i.test(node[3])
    ) {
      const authorName = node[0];
      const rating = node[2];
      const text = node[3];
      const relativeTime = typeof node[4] === "string" ? node[4] : undefined;
      reviews.push({
        id: reviewFingerprint({ authorName, rating, text, publishedAt: relativeTime }),
        authorName,
        rating,
        text,
        relativeTime,
        source: "public_maps",
      });
    }

    for (const item of node) walk(item, depth + 1);
  }

  walk(data);

  const seen = new Set<string>();
  return reviews.filter((r) => {
    const key = `${r.authorName}|${r.text.slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchPublicGoogleReviews(): Promise<PublicGooglePlace | null> {
  const config = getGoogleBusinessConfig();
  const query = config.textSearchQuery ?? config.businessName;
  const placeId = (await resolvePlaceIdFromSearch(query)) ?? config.placeId;
  if (!placeId) return null;

  const preview = await fetchPlacePreview(placeId);
  const reviewWriteUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeId)}&output=embed&hl=en`;

  let reviews: GoogleReviewRecord[] = [];
  if (preview?.embedPb) {
    try {
      const previewRes = await fetch(
        `https://www.google.com/maps/preview/place?authuser=0&hl=en&gl=in&pb=${encodeURIComponent(preview.embedPb)}`,
        {
          headers: { "User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9" },
          signal: AbortSignal.timeout(15000),
        }
      );
      if (previewRes.ok) {
        reviews = parseReviewsFromPreview(JSON.parse(stripXssi(await previewRes.text())));
      }
    } catch {
      reviews = [];
    }
  }

  return {
    placeId,
    placeHex: preview?.placeHex ?? config.placeHex,
    businessName: preview?.businessName ?? config.businessName,
    rating: preview?.rating,
    totalReviewCount: reviews.length > 0 ? reviews.length : undefined,
    mapsEmbedUrl,
    reviewWriteUrl,
    googleMapsUrl,
    reviews,
  };
}
