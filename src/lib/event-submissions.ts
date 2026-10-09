/**
 * Shared event submissions for LAF website competitions.
 *
 * Collection: laf_event_submissions (API / Admin SDK writes only)
 * Related: laf_event_votes, laf_event_reports, laf_event_email_otps, laf_event_email_sessions
 *
 * New event checklist:
 * 1. Add EVENT_SLUG constant below
 * 2. Pages + submit/upload APIs that set eventSlug
 * 3. Reuse EventEmailOtp + gallery/vote patterns
 * 4. No Firestore rule changes (shared collections already locked down)
 *
 * Drawing competition stays on drawing_* collections (already live).
 */
import { isLibraryAdmin } from "@/lib/library";

export const LAF_EVENT_SUBMISSIONS_COLLECTION = "laf_event_submissions";
export const LAF_EVENT_VOTES_COLLECTION = "laf_event_votes";
export const LAF_EVENT_REPORTS_COLLECTION = "laf_event_reports";

export const YOUNG_INNOVATORS_2026_EVENT_SLUG = "young-innovators-2026";

export type LafEventSubmissionStatus = "pending" | "approved" | "removed";

export type LafEventReportReason = "inappropriate" | "not_original" | "spam" | "other";

export const LAF_EVENT_REPORT_REASONS: { value: LafEventReportReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "not_original", label: "Not original work" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

/** Age bands for Young Innovators (6–16). Reuse or add bands per event. */
export type InnovatorsAgeGroupId = "ages_6_10" | "ages_11_16";

export const INNOVATORS_AGE_GROUPS: { id: InnovatorsAgeGroupId; label: string; min: number; max: number }[] = [
  { id: "ages_6_10", label: "Ages 6–10", min: 6, max: 10 },
  { id: "ages_11_16", label: "Ages 11–16", min: 11, max: 16 },
];

export function innovatorsAgeGroupFromAge(age: number): InnovatorsAgeGroupId | null {
  const group = INNOVATORS_AGE_GROUPS.find((g) => age >= g.min && age <= g.max);
  return group?.id ?? null;
}

export function innovatorsAgeGroupLabel(id: InnovatorsAgeGroupId | string): string {
  return INNOVATORS_AGE_GROUPS.find((g) => g.id === id)?.label ?? id;
}

export function isEventAdmin(email: string | null | undefined): boolean {
  return isLibraryAdmin(email);
}

export function isValidEventEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEventEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function eventVoteDocId(eventSlug: string, voterUid: string, entryId: string): string {
  return `${eventSlug}_${voterUid}_${entryId}`;
}

/** Public gallery card — never includes contact phone/email. */
export type LafEventPublicEntry = {
  id: string;
  eventSlug: string;
  title: string;
  description: string;
  childName: string;
  childAge: number;
  childCity: string;
  childSchool?: string | null;
  ageGroup: string;
  photo1Url: string;
  photo2Url: string;
  videoUrl: string;
  voteCount: number;
  status: LafEventSubmissionStatus;
  createdAt?: string;
};

export type LafEventAdminEntry = LafEventPublicEntry & {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  photo1FileId?: string | null;
  photo2FileId?: string | null;
};

function createdAtIso(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null && "toDate" in raw) {
    const d = (raw as { toDate?: () => Date }).toDate?.();
    return d?.toISOString();
  }
  return undefined;
}

export function entryCreatedAtMs(entry: Pick<LafEventPublicEntry, "createdAt">): number {
  if (!entry.createdAt) return 0;
  const ms = Date.parse(entry.createdAt);
  return Number.isFinite(ms) ? ms : 0;
}

export function toPublicEventEntry(
  id: string,
  data: Record<string, unknown>
): LafEventPublicEntry | null {
  const eventSlug = typeof data.eventSlug === "string" ? data.eventSlug : "";
  const title = typeof data.title === "string" ? data.title : "";
  const childName = typeof data.childName === "string" ? data.childName : "";
  const photo1Url = typeof data.photo1Url === "string" ? data.photo1Url : "";
  const photo2Url = typeof data.photo2Url === "string" ? data.photo2Url : "";
  const videoUrl = typeof data.videoUrl === "string" ? data.videoUrl : "";
  const status = data.status as LafEventSubmissionStatus;
  if (!eventSlug || !title || !childName || !photo1Url || status !== "approved") return null;

  const age = typeof data.childAge === "number" ? data.childAge : Number(data.childAge);
  const ageGroup =
    typeof data.ageGroup === "string"
      ? data.ageGroup
      : innovatorsAgeGroupFromAge(age) ?? "ages_6_10";

  return {
    id,
    eventSlug,
    title,
    description: typeof data.description === "string" ? data.description.slice(0, 400) : "",
    childName,
    childAge: Number.isFinite(age) ? age : 0,
    childCity: typeof data.childCity === "string" ? data.childCity : "",
    childSchool: typeof data.childSchool === "string" ? data.childSchool : null,
    ageGroup,
    photo1Url,
    photo2Url: photo2Url || photo1Url,
    videoUrl,
    voteCount: typeof data.voteCount === "number" ? data.voteCount : 0,
    status: "approved",
    createdAt: createdAtIso(data.createdAt),
  };
}

export function toAdminEventEntry(
  id: string,
  data: Record<string, unknown>
): LafEventAdminEntry | null {
  const eventSlug = typeof data.eventSlug === "string" ? data.eventSlug : "";
  const title = typeof data.title === "string" ? data.title : "";
  if (!eventSlug || !title) return null;

  const age = typeof data.childAge === "number" ? data.childAge : Number(data.childAge);
  const status = (data.status as LafEventSubmissionStatus) || "pending";
  const contactEmail =
    (typeof data.contactEmail === "string" && data.contactEmail) ||
    (typeof data.parentEmail === "string" ? data.parentEmail : "");
  const contactName =
    (typeof data.contactName === "string" && data.contactName) ||
    (typeof data.parentName === "string" ? data.parentName : "");
  const contactPhone =
    (typeof data.contactPhone === "string" && data.contactPhone) ||
    (typeof data.parentPhone === "string" ? data.parentPhone : "");

  return {
    id,
    eventSlug,
    title,
    description: typeof data.description === "string" ? data.description : "",
    childName: typeof data.childName === "string" ? data.childName : "",
    childAge: Number.isFinite(age) ? age : 0,
    childCity: typeof data.childCity === "string" ? data.childCity : "",
    childSchool: typeof data.childSchool === "string" ? data.childSchool : null,
    ageGroup:
      typeof data.ageGroup === "string"
        ? data.ageGroup
        : innovatorsAgeGroupFromAge(age) ?? "ages_6_10",
    photo1Url: typeof data.photo1Url === "string" ? data.photo1Url : "",
    photo2Url: typeof data.photo2Url === "string" ? data.photo2Url : "",
    videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : "",
    voteCount: typeof data.voteCount === "number" ? data.voteCount : 0,
    status,
    createdAt: createdAtIso(data.createdAt),
    contactName,
    contactEmail,
    contactPhone,
    photo1FileId: typeof data.photo1FileId === "string" ? data.photo1FileId : null,
    photo2FileId: typeof data.photo2FileId === "string" ? data.photo2FileId : null,
  };
}

export function formatChildPublicLine(entry: Pick<LafEventPublicEntry, "childName" | "childAge" | "childCity">): string {
  const parts = [entry.childName];
  if (entry.childAge) parts.push(`age ${entry.childAge}`);
  if (entry.childCity) parts.push(entry.childCity);
  return parts.join(" · ");
}

export function leaderboardByAgeGroup(
  entries: LafEventPublicEntry[],
  limit = 3
): Record<string, LafEventPublicEntry[]> {
  const map: Record<string, LafEventPublicEntry[]> = {};
  for (const group of INNOVATORS_AGE_GROUPS) {
    map[group.id] = entries
      .filter((e) => e.ageGroup === group.id)
      .sort((a, b) => b.voteCount - a.voteCount || entryCreatedAtMs(b) - entryCreatedAtMs(a))
      .slice(0, limit);
  }
  return map;
}

/** Prefer YouTube embed; Drive becomes an external “Watch video” link. */
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split("/");
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[shortsIdx + 1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function isYoutubeVideoUrl(url: string): boolean {
  return youtubeEmbedUrl(url) !== null;
}
