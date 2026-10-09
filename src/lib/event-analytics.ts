import type { EventAttribution, EventTrafficSource } from "@/lib/event-attribution";

export const LAF_EVENT_ANALYTICS_COLLECTION = "laf_event_analytics_events";
export const LAF_EVENT_COMPETITION_COLLECTION = "laf_event_competition";

export type EventAnalyticsEventType =
  | "page_view"
  | "otp_sent"
  | "otp_verified"
  | "submit_success"
  | "submit_failed";

export type EventAnalyticsPage = "home" | "gallery" | "submit";

export type EventAnalyticsEvent = {
  id: string;
  eventSlug: string;
  type: EventAnalyticsEventType;
  page?: EventAnalyticsPage;
  source: EventTrafficSource;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  entryId?: string;
  createdAt?: string;
};

export type EventAnalyticsSummary = {
  pageViews: { home: number; gallery: number; submit: number; total: number };
  bySource: Record<EventTrafficSource, number>;
  funnel: {
    otpSent: number;
    otpVerified: number;
    submitSuccess: number;
    submitFailed: number;
  };
  submissionsBySource: Record<EventTrafficSource, number>;
  conversionRate: number;
  recentDays: { date: string; visits: number; submissions: number }[];
};

export const EVENT_TRAFFIC_SOURCES: EventTrafficSource[] = [
  "instagram",
  "facebook",
  "direct",
  "other",
];

function emptyBySource(): Record<EventTrafficSource, number> {
  return { instagram: 0, facebook: 0, direct: 0, other: 0 };
}

function eventDate(iso?: string): string {
  if (!iso) return "unknown";
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "unknown";
}

export function aggregateEventAnalytics(
  events: EventAnalyticsEvent[],
  submissionSources: EventTrafficSource[] = []
): EventAnalyticsSummary {
  const pageViews = { home: 0, gallery: 0, submit: 0, total: 0 };
  const bySource = emptyBySource();
  const funnel = { otpSent: 0, otpVerified: 0, submitSuccess: 0, submitFailed: 0 };
  const submissionsBySource = emptyBySource();
  const dailyMap = new Map<string, { visits: number; submissions: number }>();

  for (const event of events) {
    const day = eventDate(event.createdAt);
    const daily = dailyMap.get(day) ?? { visits: 0, submissions: 0 };

    if (event.type === "page_view") {
      if (event.page === "home") pageViews.home++;
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

export function normalizeEventAnalyticsEvent(
  data: Record<string, unknown>,
  id: string
): EventAnalyticsEvent | null {
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

  const eventSlug = typeof data.eventSlug === "string" ? data.eventSlug : "";
  if (!eventSlug) return null;

  const source = data.source;
  const normalizedSource: EventTrafficSource =
    source === "instagram" || source === "facebook" || source === "direct" || source === "other"
      ? source
      : "other";

  let createdAt: string | undefined;
  const raw = data.createdAt;
  if (typeof raw === "string") createdAt = raw;
  else if (raw && typeof raw === "object" && "toDate" in raw && typeof raw.toDate === "function") {
    createdAt = (raw as { toDate: () => Date }).toDate().toISOString();
  }

  const page = data.page;
  return {
    id,
    eventSlug,
    type,
    page: page === "home" || page === "gallery" || page === "submit" ? page : undefined,
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
): EventAttribution | null {
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

export type InnovatorsAgeGroupId = "ages_6_10" | "ages_11_16";

export type EventCompetitionMeta = {
  title: string;
  winnersByAgeGroup?: Partial<Record<InnovatorsAgeGroupId, string>>;
  winnerAnnouncedAt?: string | null;
};

export function normalizeEventCompetitionMeta(
  data: Record<string, unknown> | undefined
): EventCompetitionMeta {
  const winnersRaw = data?.winnersByAgeGroup;
  const winnersByAgeGroup: Partial<Record<InnovatorsAgeGroupId, string>> = {};
  if (winnersRaw && typeof winnersRaw === "object") {
    const w = winnersRaw as Record<string, unknown>;
    if (typeof w.ages_6_10 === "string") winnersByAgeGroup.ages_6_10 = w.ages_6_10;
    if (typeof w.ages_11_16 === "string") winnersByAgeGroup.ages_11_16 = w.ages_11_16;
  }
  return {
    title: typeof data?.title === "string" ? data.title : "Young Innovators Challenge",
    winnersByAgeGroup,
    winnerAnnouncedAt: typeof data?.winnerAnnouncedAt === "string" ? data.winnerAnnouncedAt : null,
  };
}
