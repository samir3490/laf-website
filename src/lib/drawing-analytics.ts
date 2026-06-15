import type { DrawingAttribution, DrawingTrafficSource } from "@/lib/drawing-attribution";

export const DRAWING_ANALYTICS_EVENTS_COLLECTION = "drawing_analytics_events";

export type DrawingAnalyticsEventType =
  | "page_view"
  | "otp_sent"
  | "otp_verified"
  | "submit_success"
  | "submit_failed";

export type DrawingAnalyticsPage = "gallery" | "submit";

export type DrawingAnalyticsEvent = {
  id: string;
  type: DrawingAnalyticsEventType;
  page?: DrawingAnalyticsPage;
  source: DrawingTrafficSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  entryId?: string;
  createdAt?: string;
};

export type DrawingAnalyticsSummary = {
  pageViews: { gallery: number; submit: number; total: number };
  bySource: Record<DrawingTrafficSource, number>;
  funnel: {
    otpSent: number;
    otpVerified: number;
    submitSuccess: number;
    submitFailed: number;
  };
  submissionsBySource: Record<DrawingTrafficSource, number>;
  conversionRate: number;
  recentDays: { date: string; visits: number; submissions: number }[];
};

const SOURCES: DrawingTrafficSource[] = ["instagram", "facebook", "direct", "other"];

function emptyBySource(): Record<DrawingTrafficSource, number> {
  return { instagram: 0, facebook: 0, direct: 0, other: 0 };
}

function eventDate(iso?: string): string {
  if (!iso) return "unknown";
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "unknown";
}

export function aggregateDrawingAnalytics(
  events: DrawingAnalyticsEvent[],
  submissionSources: DrawingTrafficSource[] = []
): DrawingAnalyticsSummary {
  const pageViews = { gallery: 0, submit: 0, total: 0 };
  const bySource = emptyBySource();
  const funnel = { otpSent: 0, otpVerified: 0, submitSuccess: 0, submitFailed: 0 };
  const submissionsBySource = emptyBySource();
  const dailyMap = new Map<string, { visits: number; submissions: number }>();

  for (const event of events) {
    const day = eventDate(event.createdAt);
    const daily = dailyMap.get(day) ?? { visits: 0, submissions: 0 };

    if (event.type === "page_view") {
      if (event.page === "gallery") pageViews.gallery++;
      if (event.page === "submit") pageViews.submit++;
      pageViews.total++;
      bySource[event.source]++;
      daily.visits++;
    }
    if (event.type === "otp_sent") funnel.otpSent++;
    if (event.type === "otp_verified") funnel.otpVerified++;
    if (event.type === "submit_success") {
      funnel.submitSuccess++;
      daily.submissions++;
    }
    if (event.type === "submit_failed") funnel.submitFailed++;

    dailyMap.set(day, daily);
  }

  for (const source of submissionSources) {
    submissionsBySource[source]++;
  }

  const conversionRate =
    pageViews.submit > 0 ? Math.round((funnel.submitSuccess / pageViews.submit) * 100) : 0;

  const recentDays = [...dailyMap.entries()]
    .filter(([date]) => date !== "unknown")
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, stats]) => ({ date, ...stats }));

  return {
    pageViews,
    bySource,
    funnel,
    submissionsBySource,
    conversionRate,
    recentDays,
  };
}

export function normalizeDrawingAnalyticsEvent(
  data: Record<string, unknown>,
  id: string
): DrawingAnalyticsEvent | null {
  const type = data.type;
  if (
    type !== "page_view" &&
    type !== "otp_sent" &&
    type !== "otp_verified" &&
    type !== "submit_success" &&
    type !== "submit_failed"
  ) {
    return null;
  }

  const source = data.source;
  const normalizedSource: DrawingTrafficSource =
    source === "instagram" || source === "facebook" || source === "direct" || source === "other"
      ? source
      : "other";

  let createdAt: string | undefined;
  const raw = data.createdAt;
  if (typeof raw === "string") createdAt = raw;
  else if (raw && typeof raw === "object" && "toDate" in raw && typeof raw.toDate === "function") {
    createdAt = raw.toDate().toISOString();
  }

  return {
    id,
    type,
    page: data.page === "gallery" || data.page === "submit" ? data.page : undefined,
    source: normalizedSource,
    utmSource: typeof data.utmSource === "string" ? data.utmSource : undefined,
    utmMedium: typeof data.utmMedium === "string" ? data.utmMedium : undefined,
    utmCampaign: typeof data.utmCampaign === "string" ? data.utmCampaign : undefined,
    entryId: typeof data.entryId === "string" ? data.entryId : undefined,
    createdAt,
  };
}

export function attributionFromPayload(
  payload: Record<string, unknown> | undefined
): DrawingAttribution | null {
  if (!payload) return null;
  const source = payload.source;
  if (
    source !== "instagram" &&
    source !== "facebook" &&
    source !== "direct" &&
    source !== "other"
  ) {
    return null;
  }
  return {
    source,
    utmSource: typeof payload.utmSource === "string" ? payload.utmSource : undefined,
    utmMedium: typeof payload.utmMedium === "string" ? payload.utmMedium : undefined,
    utmCampaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : undefined,
    referrer: typeof payload.referrer === "string" ? payload.referrer : undefined,
    landingPage: typeof payload.landingPage === "string" ? payload.landingPage : undefined,
  };
}

export { SOURCES as DRAWING_TRAFFIC_SOURCES };
