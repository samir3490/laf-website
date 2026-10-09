/** First-touch attribution for LAF website events (client-only). */

import { siteUrl } from "@/lib/seo";

export type EventTrafficSource = "instagram" | "facebook" | "direct" | "other";

export type EventAttribution = {
  source: EventTrafficSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
};

function storageKey(eventSlug: string): string {
  return `laf_event_attribution_${eventSlug}`;
}

function normalizeUtmSource(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function detectTrafficSource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  fbclid: string | null | undefined
): EventTrafficSource {
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

export function captureEventAttribution(eventSlug: string): EventAttribution | null {
  if (typeof window === "undefined") return null;

  const key = storageKey(eventSlug);
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const fbclid = params.get("fbclid");
  const referrer = document.referrer || undefined;

  const hasSignal = Boolean(utmSource || utmMedium || utmCampaign || fbclid || referrer);
  if (!hasSignal) {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored) as EventAttribution;
    } catch {
      /* ignore */
    }
    return {
      source: "direct",
      landingPage: window.location.pathname,
    };
  }

  const attribution: EventAttribution = {
    source: detectTrafficSource(utmSource, referrer, fbclid),
    ...(utmSource ? { utmSource } : {}),
    ...(utmMedium ? { utmMedium } : {}),
    ...(utmCampaign ? { utmCampaign } : {}),
    ...(referrer ? { referrer: referrer.slice(0, 500) } : {}),
    landingPage: window.location.pathname,
  };

  try {
    const existing = sessionStorage.getItem(key);
    if (!existing) {
      sessionStorage.setItem(key, JSON.stringify(attribution));
    } else {
      return JSON.parse(existing) as EventAttribution;
    }
  } catch {
    /* ignore */
  }

  return attribution;
}

export function getStoredEventAttribution(eventSlug: string): EventAttribution {
  if (typeof window === "undefined") {
    return { source: "direct" };
  }
  try {
    const stored = sessionStorage.getItem(storageKey(eventSlug));
    if (stored) return JSON.parse(stored) as EventAttribution;
  } catch {
    /* ignore */
  }
  return { source: "direct", landingPage: window.location.pathname };
}

export function eventSocialLink(
  eventSlug: string,
  page: "home" | "gallery" | "submit",
  platform: "instagram" | "facebook",
  campaign: string
): string {
  // Path map for known website events (add new events here).
  const paths: Record<string, Record<"home" | "gallery" | "submit", string>> = {
    "young-innovators-2026": {
      home: "/events/young-innovators",
      gallery: "/events/young-innovators/gallery",
      submit: "/events/young-innovators/submit",
    },
  };
  const path = paths[eventSlug]?.[page] ?? "/events";

  const params = new URLSearchParams({
    utm_source: platform,
    utm_medium: "social",
    utm_campaign: campaign,
  });
  return `${siteUrl(path)}?${params.toString()}`;
}
