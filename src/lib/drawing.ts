import { isLibraryAdmin } from "@/lib/library";

export const DRAWING_ENTRIES_COLLECTION = "drawing_entries";
export const DRAWING_VOTES_COLLECTION = "drawing_votes";
export const DRAWING_COMPETITION_COLLECTION = "drawing_competition";
export const DRAWING_REPORTS_COLLECTION = "drawing_reports";
export const DRAWING_META_DOC_ID = "meta";

export const DRAWING_VOTER_COOKIE = "laf_drawing_voter";
export const DRAWING_VOTED_STORAGE_KEY = "laf_drawing_voted";

export const MAX_DRAWING_BYTES = 5 * 1024 * 1024;
export const MIN_DRAWING_BYTES = 10 * 1024;

export type DrawingEntryStatus = "pending" | "active" | "removed";

export type AgeGroupId = "under_6" | "7_10" | "11_14" | "15_18";

export const AGE_GROUPS: { id: AgeGroupId; label: string }[] = [
  { id: "under_6", label: "Under 6" },
  { id: "7_10", label: "7–10" },
  { id: "11_14", label: "11–14" },
  { id: "15_18", label: "15–18" },
];

export type DrawingCompetitionMeta = {
  title: string;
  theme: string;
  rulesHtml: string;
  submissionOpen: boolean;
  votingOpen: boolean;
  submissionEndsAt?: string | null;
  votingEndsAt?: string | null;
  winnerEntryId?: string | null;
  winnerAnnouncedAt?: string | null;
  /** One winner per age group (entry id). */
  winnersByAgeGroup?: Partial<Record<AgeGroupId, string>>;
  /** Weight for judge score in combined ranking (0–1). Default 0 */
  judgeWeight?: number;
  /** Weight for public votes in combined ranking (0–1). Default 1 */
  publicVoteWeight?: number;
};

export type DrawingEntry = {
  id: string;
  title: string;
  /** Child first name — shown publicly */
  artistName: string;
  artistAge?: number;
  artistClass?: string;
  artistSchool?: string;
  artistCity?: string;
  ageGroup: AgeGroupId;
  imageUrl: string;
  driveFileId?: string;
  imagePath?: string;
  voteCount: number;
  /** Admin-only in UI; not exposed on public gallery API */
  judgeScore?: number;
  status: DrawingEntryStatus;
  createdAt?: { toDate?: () => Date } | string;
};

export type DrawingEntryAdmin = DrawingEntry & {
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  submitterUid: string;
};

export function entryCreatedAtMs(entry: Pick<DrawingEntry, "createdAt">): number {
  const ts = entry.createdAt;
  if (!ts) return 0;
  if (typeof ts === "string") {
    const ms = Date.parse(ts);
    return Number.isFinite(ms) ? ms : 0;
  }
  return ts.toDate?.()?.getTime() ?? 0;
}

export type DrawingReportReason = "inappropriate" | "not_original" | "spam" | "other";

export const DEFAULT_COMPETITION_META: DrawingCompetitionMeta = {
  title: "LAF Drawing Competition",
  theme: "Education, hope, and community",
  rulesHtml:
    "<p>Submit original artwork (paintings, drawings, or digital art). A parent or guardian must verify their email with a one-time code to upload. Safe artwork is published automatically; others are reviewed by LAF. Sign in with Google to vote — one vote per account per drawing. You can report any entry that looks inappropriate.</p>",
  submissionOpen: true,
  votingOpen: true,
  submissionEndsAt: null,
  votingEndsAt: null,
  winnerEntryId: null,
  winnerAnnouncedAt: null,
  winnersByAgeGroup: {},
  judgeWeight: 0,
  publicVoteWeight: 1,
};

export function isDrawingAdmin(email: string | null | undefined): boolean {
  return isLibraryAdmin(email);
}

export function ageGroupForAge(age: number): AgeGroupId {
  if (age <= 6) return "under_6";
  if (age <= 10) return "7_10";
  if (age <= 14) return "11_14";
  return "15_18";
}

export function ageGroupLabel(id: AgeGroupId): string {
  return AGE_GROUPS.find((g) => g.id === id)?.label ?? id;
}

export function normalizeCompetitionMeta(data: Record<string, unknown> | undefined): DrawingCompetitionMeta {
  if (!data) return DEFAULT_COMPETITION_META;
  const judgeWeight =
    typeof data.judgeWeight === "number" && data.judgeWeight >= 0 && data.judgeWeight <= 1
      ? data.judgeWeight
      : DEFAULT_COMPETITION_META.judgeWeight!;
  const publicVoteWeight =
    typeof data.publicVoteWeight === "number" && data.publicVoteWeight >= 0 && data.publicVoteWeight <= 1
      ? data.publicVoteWeight
      : DEFAULT_COMPETITION_META.publicVoteWeight!;

  const winnersByAgeGroup: Partial<Record<AgeGroupId, string>> = {};
  const rawWinners = data.winnersByAgeGroup;
  if (rawWinners && typeof rawWinners === "object" && !Array.isArray(rawWinners)) {
    for (const group of AGE_GROUPS) {
      const id = (rawWinners as Record<string, unknown>)[group.id];
      if (typeof id === "string" && id.trim()) winnersByAgeGroup[group.id] = id.trim();
    }
  }

  return {
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : DEFAULT_COMPETITION_META.title,
    theme: typeof data.theme === "string" ? data.theme.trim() : DEFAULT_COMPETITION_META.theme,
    rulesHtml: typeof data.rulesHtml === "string" ? data.rulesHtml : DEFAULT_COMPETITION_META.rulesHtml,
    submissionOpen: data.submissionOpen !== false,
    votingOpen: data.votingOpen !== false,
    submissionEndsAt: typeof data.submissionEndsAt === "string" ? data.submissionEndsAt : null,
    votingEndsAt: typeof data.votingEndsAt === "string" ? data.votingEndsAt : null,
    winnerEntryId: typeof data.winnerEntryId === "string" ? data.winnerEntryId : null,
    winnerAnnouncedAt: typeof data.winnerAnnouncedAt === "string" ? data.winnerAnnouncedAt : null,
    winnersByAgeGroup,
    judgeWeight,
    publicVoteWeight,
  };
}

function parseStatus(value: unknown): DrawingEntryStatus {
  if (value === "pending" || value === "active" || value === "removed") return value;
  return "active";
}

function parseAgeGroup(value: unknown, artistAge?: number): AgeGroupId {
  if (value === "under_6" || value === "7_10" || value === "11_14" || value === "15_18") return value;
  if (artistAge != null) return ageGroupForAge(artistAge);
  return "7_10";
}

export function normalizeDrawingEntry(
  data: Record<string, unknown>,
  id: string
): DrawingEntry | null {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const artistName = typeof data.artistName === "string" ? data.artistName.trim() : "";
  const imageUrl = typeof data.imageUrl === "string" ? data.imageUrl.trim() : "";
  const driveFileId = typeof data.driveFileId === "string" ? data.driveFileId.trim() : undefined;
  const imagePath = typeof data.imagePath === "string" ? data.imagePath.trim() : undefined;
  if (!title || !artistName || !imageUrl) return null;

  const artistAge = typeof data.artistAge === "number" ? data.artistAge : undefined;
  const status = parseStatus(data.status);
  const artistClass = typeof data.artistClass === "string" ? data.artistClass.trim() : undefined;
  const artistSchool = typeof data.artistSchool === "string" ? data.artistSchool.trim() : undefined;
  const artistCity = typeof data.artistCity === "string" ? data.artistCity.trim() : undefined;
  const voteCount = typeof data.voteCount === "number" ? data.voteCount : 0;
  const judgeScore =
    typeof data.judgeScore === "number" && data.judgeScore >= 0 && data.judgeScore <= 100
      ? data.judgeScore
      : undefined;

  return {
    id,
    title,
    artistName,
    artistAge,
    artistClass,
    artistSchool,
    artistCity,
    ageGroup: parseAgeGroup(data.ageGroup, artistAge),
    imageUrl,
    driveFileId,
    imagePath,
    voteCount,
    judgeScore,
    status,
    createdAt: data.createdAt as DrawingEntry["createdAt"],
  };
}

export function normalizeDrawingEntryAdmin(
  data: Record<string, unknown>,
  id: string
): DrawingEntryAdmin | null {
  const base = normalizeDrawingEntry(data, id);
  if (!base) return null;
  const parentName = typeof data.parentName === "string" ? data.parentName.trim() : "";
  const parentEmail = typeof data.parentEmail === "string" ? data.parentEmail.trim() : "";
  const parentPhone = typeof data.parentPhone === "string" ? data.parentPhone.trim() : "";
  const submitterUid = typeof data.submitterUid === "string" ? data.submitterUid.trim() : "";
  if (!parentName || !parentEmail) {
    return { ...base, parentName: parentName || "—", parentEmail, parentPhone, submitterUid };
  }
  return { ...base, parentName, parentEmail, parentPhone, submitterUid };
}

export function competitionPhase(meta: DrawingCompetitionMeta): {
  submissionsAllowed: boolean;
  votingAllowed: boolean;
} {
  const now = Date.now();
  const submissionEnds = meta.submissionEndsAt ? Date.parse(meta.submissionEndsAt) : null;
  const votingEnds = meta.votingEndsAt ? Date.parse(meta.votingEndsAt) : null;

  const submissionsAllowed =
    meta.submissionOpen && (submissionEnds === null || !Number.isFinite(submissionEnds) || now <= submissionEnds);
  const votingAllowed =
    meta.votingOpen && (votingEnds === null || !Number.isFinite(votingEnds) || now <= votingEnds);

  return { submissionsAllowed, votingAllowed };
}

export function voteDocId(voterUid: string, entryId: string): string {
  return `${voterUid}_${entryId}`;
}

/** Combined ranking score (0–1 scale) for admin winner selection. */
export function combinedEntryScore(
  entry: Pick<DrawingEntry, "voteCount" | "judgeScore">,
  meta: Pick<DrawingCompetitionMeta, "judgeWeight" | "publicVoteWeight">,
  maxVoteCount: number
): number {
  const judgeWeight = meta.judgeWeight ?? 0;
  const voteWeight = meta.publicVoteWeight ?? 1;
  const judgeNorm = (entry.judgeScore ?? 0) / 100;
  const voteNorm = maxVoteCount > 0 ? entry.voteCount / maxVoteCount : 0;
  return judgeWeight * judgeNorm + voteWeight * voteNorm;
}

/** Public display line for gallery cards — first name, age group, class, school, city. */
export function formatArtistPublicLine(
  entry: Pick<
    DrawingEntry,
    "artistName" | "artistAge" | "artistClass" | "artistSchool" | "artistCity" | "ageGroup"
  >
): string {
  const parts: string[] = [entry.artistName];
  parts.push(ageGroupLabel(entry.ageGroup));
  if (entry.artistClass) parts.push(`Class ${entry.artistClass}`);
  if (entry.artistSchool) parts.push(entry.artistSchool);
  if (entry.artistCity) parts.push(entry.artistCity);
  return parts.join(" · ");
}

/** Top entries by vote count within each age group (for category leaderboards). */
export function leaderboardByAgeGroup(
  entries: DrawingEntry[],
  limitPerGroup = 3
): Record<AgeGroupId, DrawingEntry[]> {
  const result = {} as Record<AgeGroupId, DrawingEntry[]>;
  for (const group of AGE_GROUPS) {
    result[group.id] = entries
      .filter((e) => e.ageGroup === group.id)
      .sort((a, b) => b.voteCount - a.voteCount || entryCreatedAtMs(b) - entryCreatedAtMs(a))
      .slice(0, limitPerGroup);
  }
  return result;
}

/** Top entry by public votes in an age group. */
export function topEntryByVotesInGroup(entries: DrawingEntry[], ageGroup: AgeGroupId): DrawingEntry | null {
  const inGroup = entries.filter((e) => e.ageGroup === ageGroup);
  if (inGroup.length === 0) return null;
  return inGroup.sort((a, b) => b.voteCount - a.voteCount || entryCreatedAtMs(b) - entryCreatedAtMs(a))[0];
}

/** Top entry by combined score in an age group (admin winner pick). */
export function topCombinedInGroup(
  entries: DrawingEntry[],
  ageGroup: AgeGroupId,
  meta: Pick<DrawingCompetitionMeta, "judgeWeight" | "publicVoteWeight">
): DrawingEntry | null {
  const inGroup = entries.filter((e) => e.ageGroup === ageGroup);
  if (inGroup.length === 0) return null;
  const maxVotes = Math.max(1, ...inGroup.map((e) => e.voteCount));
  return [...inGroup].sort(
    (a, b) =>
      combinedEntryScore(b, meta, maxVotes) - combinedEntryScore(a, meta, maxVotes) ||
      b.voteCount - a.voteCount
  )[0];
}

export function normalizeIndiaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (input.startsWith("+") && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
