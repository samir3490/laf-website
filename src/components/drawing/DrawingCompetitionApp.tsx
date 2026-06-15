"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import DrawingEntryImage from "@/components/drawing/DrawingEntryImage";
import {
  AGE_GROUPS,
  ageGroupLabel,
  competitionPhase,
  DEFAULT_COMPETITION_META,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_META_DOC_ID,
  entryCreatedAtMs,
  formatArtistPublicLine,
  leaderboardByAgeGroup,
  normalizeCompetitionMeta,
  type AgeGroupId,
  type DrawingCompetitionMeta,
  type DrawingEntry,
  type DrawingReportReason,
} from "@/lib/drawing";
import { getFirebaseAuth, getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";
import { trackDrawingVote } from "@/lib/gtag";
import { DRAWING_COMPETITION_DATES } from "@/lib/drawing-competition-promo";

type SortMode = "votes" | "newest";

const REPORT_REASONS: { value: DrawingReportReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "not_original", label: "Not original work" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

export default function DrawingCompetitionApp() {
  const searchParams = useSearchParams();
  const submittedPending = searchParams.get("submitted") === "pending";
  const submittedLive = searchParams.get("submitted") === "live";
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const [meta, setMeta] = useState<DrawingCompetitionMeta | null>(null);
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState("");
  const [sort, setSort] = useState<SortMode>("votes");
  const [ageFilter, setAgeFilter] = useState<AgeGroupId | "all">("all");
  const [voteUser, setVoteUser] = useState<User | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [reportEntry, setReportEntry] = useState<DrawingEntry | null>(null);
  const [reportReason, setReportReason] = useState<DrawingReportReason>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const thanksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submittedPending && !submittedLive) return;
    const el = thanksRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [submittedPending, submittedLive]);

  const loadEntries = useCallback(async () => {
    setEntriesError("");
    try {
      const res = await fetch("/api/drawing/entries");
      const data = (await res.json()) as { entries?: DrawingEntry[]; error?: string };
      if (!res.ok) {
        setEntriesError(data.error ?? "Could not load entries.");
        setEntries([]);
        return;
      }
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setEntriesError("Could not load entries. Check your connection and try again.");
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  const loadMyVotes = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/drawing/my-votes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { entryIds?: string[] };
      if (res.ok && Array.isArray(data.entryIds)) {
        setVotedIds(new Set(data.entryIds));
      }
    } catch {
      setVotedIds(new Set());
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, submittedPending, submittedLive]);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => {
      setVoteUser(user);
      if (user) void loadMyVotes(user);
      else setVotedIds(new Set());
    });
  }, [auth, loadMyVotes]);

  useEffect(() => {
    if (!db) return;
    const metaUnsub = onSnapshot(doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID), (snap) => {
      setMeta(normalizeCompetitionMeta(snap.data() as Record<string, unknown> | undefined));
    });
    return () => metaUnsub();
  }, [db]);

  const effectiveMeta = meta ?? DEFAULT_COMPETITION_META;
  const phase = useMemo(() => competitionPhase(effectiveMeta), [effectiveMeta]);

  const filteredEntries = useMemo(() => {
    if (ageFilter === "all") return entries;
    return entries.filter((e) => e.ageGroup === ageFilter);
  }, [entries, ageFilter]);

  const sortedEntries = useMemo(() => {
    const list = [...filteredEntries];
    if (sort === "votes") {
      list.sort((a, b) => b.voteCount - a.voteCount || entryCreatedAtMs(b) - entryCreatedAtMs(a));
    } else {
      list.sort((a, b) => entryCreatedAtMs(b) - entryCreatedAtMs(a));
    }
    return list;
  }, [filteredEntries, sort]);

  const categoryLeaderboard = useMemo(() => leaderboardByAgeGroup(entries, 3), [entries]);

  const categoryWinners = useMemo(() => {
    const winners = effectiveMeta.winnersByAgeGroup ?? {};
    return AGE_GROUPS.map((group) => {
      const entryId = winners[group.id];
      const entry = entryId ? entries.find((e) => e.id === entryId) : null;
      return { group, entry };
    }).filter((row) => row.entry);
  }, [entries, effectiveMeta.winnersByAgeGroup]);

  async function signInToVote() {
    if (!auth) return;
    setAuthBusy(true);
    setVoteMsg("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch {
      setVoteMsg("Google sign-in was cancelled or failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  const handleVote = useCallback(
    async (entry: DrawingEntry) => {
      if (!phase.votingAllowed) {
        setVoteMsg("Voting is closed.");
        return;
      }
      if (!voteUser) {
        setVoteMsg("Please sign in with Google to vote.");
        return;
      }
      if (votedIds.has(entry.id)) return;

      setVotingId(entry.id);
      setVoteMsg("");
      try {
        const token = await voteUser.getIdToken();
        const res = await fetch("/api/drawing/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ entryId: entry.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setVoteMsg(data.error ?? "Vote failed.");
          return;
        }
        if (!data.alreadyVoted) {
          trackDrawingVote(entry.id);
          setVotedIds((prev) => new Set(prev).add(entry.id));
        }
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, voteCount: data.voteCount as number } : e))
        );
      } catch {
        setVoteMsg("Vote failed. Please try again.");
      } finally {
        setVotingId(null);
      }
    },
    [phase.votingAllowed, voteUser, votedIds]
  );

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportEntry) return;
    setReportBusy(true);
    setReportMsg("");
    try {
      const res = await fetch("/api/drawing/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: reportEntry.id,
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReportMsg(data.error ?? "Report failed.");
        return;
      }
      setReportMsg("Thank you. Our team will review this entry.");
      setTimeout(() => {
        setReportEntry(null);
        setReportDetails("");
        setReportMsg("");
      }, 2000);
    } catch {
      setReportMsg("Report failed. Please try again.");
    } finally {
      setReportBusy(false);
    }
  }

  if (!config) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-laf-navy font-semibold">Setup required</p>
        <p className="mt-2 text-sm text-laf-muted">Firebase environment variables are missing.</p>
      </div>
    );
  }

  const sidebar = (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <div className="rounded-2xl border border-laf-border bg-white p-4 space-y-3">
        <h3 className="font-semibold text-laf-navy text-sm">Quick actions</h3>
        <p className="text-xs text-laf-muted leading-relaxed">
          {voteUser
            ? `Signed in as ${voteUser.displayName || voteUser.email}`
            : "Sign in with Google to vote — one account, one vote per drawing."}
        </p>
        <div className="flex flex-col gap-2">
          {voteUser ? (
            <button
              type="button"
              onClick={() => auth && signOut(auth)}
              className="w-full px-4 py-2.5 rounded-lg border border-laf-border text-sm font-medium text-laf-navy"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              disabled={authBusy || !auth}
              onClick={() => void signInToVote()}
              className="w-full px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
            >
              {authBusy ? "Signing in…" : "Sign in with Google"}
            </button>
          )}
          {phase.submissionsAllowed && (
            <Link
              href="/events/drawing-competition/submit"
              className="w-full text-center px-4 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold hover:bg-laf-navy/90 transition-colors"
            >
              Submit artwork
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-laf-border bg-white p-4">
        <h3 className="font-semibold text-laf-navy text-sm mb-3">Vote rankings by category</h3>
        <div className="space-y-4">
          {AGE_GROUPS.map((group) => {
            const top = categoryLeaderboard[group.id];
            return (
              <div key={group.id}>
                <p className="text-xs font-semibold text-laf-gold uppercase tracking-wide mb-2">{group.label}</p>
                {top.length === 0 ? (
                  <p className="text-xs text-laf-muted">No entries yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {top.map((entry, i) => (
                      <li key={entry.id} className="flex gap-2 text-xs">
                        <span className="font-bold text-laf-navy w-4 shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-laf-navy truncate">{entry.title}</p>
                          <p className="text-laf-muted truncate">
                            {entry.artistName} · {entry.voteCount} votes
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="space-y-6">
      {(submittedPending || submittedLive) && (
        <div
          ref={thanksRef}
          id="drawing-submit-thanks"
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-laf-navy scroll-mt-28"
          tabIndex={-1}
        >
          {submittedLive ? (
            <>
              Thank you! Your artwork is <strong>live in the gallery</strong>. Sign in with Google to vote for your
              favourites.
            </>
          ) : (
            <>
              Thank you! Your artwork was received and is <strong>pending LAF review</strong>. It will appear in the
              gallery after approval.
            </>
          )}
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
        <div className="order-1 lg:hidden">{sidebar}</div>

        <main className="order-2 lg:order-1 space-y-6 min-w-0">
          <div className="rounded-2xl border border-laf-border bg-white p-5 lg:p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold mb-1">
                {DRAWING_COMPETITION_DATES.label}
              </p>
              <h2 className="text-xl lg:text-2xl font-bold text-laf-navy">{effectiveMeta.title}</h2>
              {effectiveMeta.theme && <p className="mt-1 text-sm text-laf-muted">Theme: {effectiveMeta.theme}</p>}
            </div>
            <div
              className="prose prose-sm max-w-none text-laf-muted"
              dangerouslySetInnerHTML={{ __html: effectiveMeta.rulesHtml }}
            />
            <div className="flex flex-wrap gap-2 text-xs text-laf-muted">
              <span
                className={`px-2.5 py-1 rounded-full ${phase.submissionsAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}
              >
                Submissions: {phase.submissionsAllowed ? "Open" : "Closed"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full ${phase.votingAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}
              >
                Voting: {phase.votingAllowed ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          {categoryWinners.length > 0 && (
            <div className="rounded-2xl border-2 border-laf-gold bg-laf-cream/60 p-5 lg:p-6 space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-laf-gold">Category winners</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {categoryWinners.map(({ group, entry }) =>
                  entry ? (
                    <div key={group.id} className="rounded-xl border border-laf-border bg-white p-4">
                      <p className="text-xs font-semibold text-laf-gold">{group.label}</p>
                      <h3 className="mt-1 font-bold text-laf-navy">{entry.title}</h3>
                      <p className="text-sm text-laf-muted">
                        {formatArtistPublicLine(entry)} · {entry.voteCount} votes
                      </p>
                      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg border border-laf-border bg-laf-cream/30">
                        <DrawingEntryImage entry={entry} alt={entry.title} sizes="240px" />
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg font-semibold text-laf-navy">Gallery</h3>
              <div className="flex flex-wrap gap-2">
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value as AgeGroupId | "all")}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg text-sm border border-laf-border bg-white"
                >
                  <option value="all">All age groups</option>
                  {AGE_GROUPS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSort("votes")}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm ${sort === "votes" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"}`}
                  >
                    Most votes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSort("newest")}
                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm ${sort === "newest" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"}`}
                  >
                    Newest
                  </button>
                </div>
              </div>
            </div>

            {voteMsg && <p className="text-sm text-red-600">{voteMsg}</p>}

            {entriesError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-800">{entriesError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setEntriesLoading(true);
                    void loadEntries();
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-laf-navy text-white text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            ) : entriesLoading ? (
              <p className="text-sm text-laf-muted">Loading entries…</p>
            ) : sortedEntries.length === 0 ? (
              <p className="text-sm text-laf-muted">No entries in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {sortedEntries.map((entry) => {
                  const hasVoted = votedIds.has(entry.id);
                  const canVote = phase.votingAllowed && voteUser && !hasVoted;
                  return (
                    <article
                      key={entry.id}
                      className="rounded-2xl border border-laf-border bg-white overflow-hidden shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-laf-cream/30">
                        <DrawingEntryImage entry={entry} alt={entry.title} />
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-semibold text-laf-navy">{entry.title}</h4>
                          <p className="text-sm text-laf-muted">{formatArtistPublicLine(entry)}</p>
                          <p className="text-xs text-laf-muted mt-0.5">{ageGroupLabel(entry.ageGroup)}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-laf-navy">{entry.voteCount} votes</span>
                          {!voteUser ? (
                            <button
                              type="button"
                              onClick={() => void signInToVote()}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-laf-gold text-laf-gold"
                            >
                              Sign in to vote
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canVote || votingId === entry.id}
                              onClick={() => handleVote(entry)}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-laf-gold text-white hover:bg-laf-gold-bright disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {hasVoted ? "Voted" : votingId === entry.id ? "…" : "Vote"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setReportEntry(entry);
                              setReportReason("inappropriate");
                              setReportDetails("");
                              setReportMsg("");
                            }}
                            className="text-xs text-laf-muted hover:text-laf-navy underline ml-auto sm:ml-0"
                          >
                            Report
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <div className="order-3 lg:order-2 hidden lg:block">{sidebar}</div>
      </div>

      {reportEntry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <form
            onSubmit={handleReport}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-laf-navy">Report entry</h3>
            <p className="text-sm text-laf-muted">{reportEntry.title}</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as DrawingReportReason)}
              className="w-full px-3 py-2 rounded-lg border border-laf-border text-base"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Optional details"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-laf-border text-base"
            />
            {reportMsg && <p className="text-sm text-laf-muted">{reportMsg}</p>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setReportEntry(null)} className="px-4 py-2 text-sm text-laf-muted">
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportBusy}
                className="px-4 py-2 rounded-lg bg-laf-navy text-white text-sm font-medium disabled:opacity-60"
              >
                {reportBusy ? "Sending…" : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
