"use client";

import { useEffect } from "react";
import {
  captureDrawingAttribution,
  getStoredDrawingAttribution,
  type DrawingAttribution,
} from "@/lib/drawing-attribution";
import type { DrawingAnalyticsEventType, DrawingAnalyticsPage } from "@/lib/drawing-analytics";
import { trackDrawingPageView } from "@/lib/gtag";

const SESSION_PREFIX = "laf_drawing_tracked_";

type DrawingAnalyticsProps = {
  page: DrawingAnalyticsPage;
};

export async function trackDrawingEvent(
  event: DrawingAnalyticsEventType,
  page?: DrawingAnalyticsPage,
  extra?: { entryId?: string }
) {
  const attribution = getStoredDrawingAttribution();
  void fetch("/api/drawing/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page, attribution, ...extra }),
  }).catch(() => {});
}

export function trackDrawingEventWithAttribution(
  event: DrawingAnalyticsEventType,
  attribution: DrawingAttribution,
  page?: DrawingAnalyticsPage,
  extra?: { entryId?: string }
) {
  void fetch("/api/drawing/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page, attribution, ...extra }),
  }).catch(() => {});
}

export default function DrawingAnalytics({ page }: DrawingAnalyticsProps) {
  useEffect(() => {
    const sessionKey = `${SESSION_PREFIX}${page}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      /* continue */
    }

    const attribution = captureDrawingAttribution() ?? getStoredDrawingAttribution();
    trackDrawingPageView(page, attribution.source);
    void trackDrawingEvent("page_view", page);
  }, [page]);

  return null;
}
