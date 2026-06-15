/** First-touch attribution for drawing competition traffic (client-only). */

import { siteUrl } from "@/lib/seo";

export type DrawingAttribution = {
  source: DrawingTrafficSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
};

export type DrawingTrafficSource =
  | "instagram"
  | "facebook"
  | "direct"
  | "other";

const STORAGE_KEY = "laf_drawing_attribution";

function normalizeUtmSource(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function detectTrafficSource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  fbclid: string | null | undefined
): DrawingTrafficSource {
  const source = normalizeUtmSource(utmSource);

  if (source.includes("instagram") || source === "ig") return "instagram";
  if (source.includes("facebook") || source === "fb") return "facebook";
  if (fbclid) return "facebook";

  const ref = (referrer ?? "").toLowerCase();
  if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) return "instagram";
  if (
    ref.includes("facebook.com") ||
    ref.includes("fb.com") ||
    ref.includes("m.facebook.com") ||
    ref.includes("l.facebook.com")
  ) {
    return "facebook";
  }

  if (!source && !ref) return "direct";
  return "other";
}

export function captureDrawingAttribution(): DrawingAttribution | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const fbclid = params.get("fbclid");
  const referrer = document.referrer || undefined;

  const hasSignal = Boolean(utmSource || utmMedium || utmCampaign || fbclid || referrer);
  if (!hasSignal) {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as DrawingAttribution;
    } catch {
      /* ignore */
    }
    return {
      source: "direct",
      landingPage: window.location.pathname,
    };
  }

  const attribution: DrawingAttribution = {
    source: detectTrafficSource(utmSource, referrer, fbclid),
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(referrer ? { referrer: referrer.slice(0, 500) } : {}),
    landingPage: window.location.pathname,
  };

  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (!existing) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } else {
      return JSON.parse(existing) as DrawingAttribution;
    }
  } catch {
    /* ignore */
  }

  return attribution;
}

export function getStoredDrawingAttribution(): DrawingAttribution {
  if (typeof window === "undefined") {
    return { source: "direct" };
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as DrawingAttribution;
  } catch {
    /* ignore */
  }
  return { source: "direct", landingPage: window.location.pathname };
}

/** UTM-tagged links for Instagram / Facebook posts. */
export function drawingSocialLink(
  page: "gallery" | "submit",
  platform: "instagram" | "facebook"
): string {
  const base =
    page === "submit"
      ? siteUrl("/events/drawing-competition/submit")
      : siteUrl("/events/drawing-competition");
  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: "social",
    utm_campaign: "drawing-competition-2026",
  });
  return `${base}?${params.toString()}`;
}
