"use client";

import { useEffect } from "react";
import {
  captureEventAttribution,
  getStoredEventAttribution,
  type EventAttribution,
} from "@/lib/event-attribution";
import type { EventAnalyticsEventType, EventAnalyticsPage } from "@/lib/event-analytics";

type EventAnalyticsProps = {
  eventSlug: string;
  page: EventAnalyticsPage;
};

export async function trackEventAnalytics(
  eventSlug: string,
  event: EventAnalyticsEventType,
  page?: EventAnalyticsPage,
  extra?: { entryId?: string }
) {
  const attribution = getStoredEventAttribution(eventSlug);
  void fetch("/api/events/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventSlug, event, page, attribution, ...extra }),
  }).catch(() => {});
}

export function trackEventAnalyticsWithAttribution(
  eventSlug: string,
  event: EventAnalyticsEventType,
  attribution: EventAttribution,
  page?: EventAnalyticsPage,
  extra?: { entryId?: string }
) {
  void fetch("/api/events/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventSlug, event, page, attribution, ...extra }),
  }).catch(() => {});
}

/** Drop on event pages to record one page_view per browser session. */
export default function EventAnalytics({ eventSlug, page }: EventAnalyticsProps) {
  useEffect(() => {
    const sessionKey = `laf_event_tracked_${eventSlug}_${page}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* continue */
    }

    captureEventAttribution(eventSlug) ?? getStoredEventAttribution(eventSlug);
    void trackEventAnalytics(eventSlug, "page_view", page);
  }, [eventSlug, page]);

  return null;
}
