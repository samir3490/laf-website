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

export type DrawingEntryStatus = "active" | "removed";

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
};

export type DrawingEntry = {
  id: string;
  title: string;
  artistName: string;
  artistAge?: number;
  artistCity?: string;
  imageUrl: string;
  /** Google Drive file ID (preferred storage). */
  driveFileId?: string;
  /** Legacy Firebase Storage path — older entries only. */
  imagePath?: string;
  voteCount: number;
  status: DrawingEntryStatus;
  createdAt?: { toDate?: () => Date };
};

export type DrawingReportReason = "inappropriate" | "not_original" | "spam" | "other";

export const DEFAULT_COMPETITION_META: DrawingCompetitionMeta = {
  title: "LAF Drawing Competition",
  theme: "Education, hope, and community",
  rulesHtml:
    "<p>Submit your original artwork (paintings, drawings, or digital art). One vote per person per entry. Voting is best-effort via browser cookie — please vote fairly.</p>",
  submissionOpen: true,
  votingOpen: true,
  submissionEndsAt: null,
  votingEndsAt: null,
  winnerEntryId: null,
  winnerAnnouncedAt: null,
};

export function isDrawingAdmin(email: string | null | undefined): boolean {
  return isLibraryAdmin(email);
}

export function normalizeCompetitionMeta(data: Record<string, unknown> | undefined): DrawingCompetitionMeta {
  if (!data) return DEFAULT_COMPETITION_META;
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
  };
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

  const status: DrawingEntryStatus = data.status === "removed" ? "removed" : "active";
  const artistAge = typeof data.artistAge === "number" ? data.artistAge : undefined;
  const artistCity = typeof data.artistCity === "string" ? data.artistCity.trim() : undefined;
  const voteCount = typeof data.voteCount === "number" ? data.voteCount : 0;

  return {
    id,
    title,
    artistName,
    artistAge,
    artistCity,
    imageUrl,
    driveFileId,
    imagePath,
    voteCount,
    status,
    createdAt: data.createdAt as DrawingEntry["createdAt"],
  };
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

export function voteDocId(voterId: string, entryId: string): string {
  return `${voterId}_${entryId}`;
}
