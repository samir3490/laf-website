"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import {
  AGE_GROUPS,
  competitionPhase,
  DEFAULT_COMPETITION_META,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_META_DOC_ID,
  entryCreatedAtMs,
  formatArtistPublicLine,
  normalizeCompetitionMeta,
  type AgeGroupId,
  type DrawingCompetitionMeta,
  type DrawingEntry,
  type DrawingReportReason,
} from "@/lib/drawing";
import { getFirebaseAuth, getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";
import { trackDrawingVote } from "@/lib/gtag";

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
  }, [loadEntries, submittedPending]);

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

  const leaderboard = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries]);
  const winner = useMemo(
    () => (effectiveMeta.winnerEntryId ? entries.find((e) => e.id === effectiveMeta.winnerEntryId) : null),
    [entries, effectiveMeta.winnerEntryId]
  );

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

  return (
    <div className="space-y-10">
      {submittedPending && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-laf-navy">
          Thank you! Your artwork was received and is <strong>pending LAF review</strong>. It will appear in the
          gallery after approval. You will not be able to vote until it is approved.
        </div>
      )}

      <div className="rounded-2xl border border-laf-border bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-laf-muted">
          {voteUser
            ? `Signed in to vote as ${voteUser.displayName || voteUser.email}`
            : "Sign in with Google to vote — one account, one vote per drawing."}
        </p>
        <div className="flex gap-2">
          {voteUser ? (
            <button
              type="button"
              onClick={() => auth && signOut(auth)}
              className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              disabled={authBusy || !auth}
              onClick={() => void signInToVote()}
              className="px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
            >
              {authBusy ? "Signing in…" : "Sign in with Google to vote"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-laf-navy">{effectiveMeta.title}</h2>
            {effectiveMeta.theme && <p className="mt-1 text-laf-muted">Theme: {effectiveMeta.theme}</p>}
          </div>
          {phase.submissionsAllowed && (
            <Link
              href="/events/drawing-competition/submit"
              className="px-5 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
            >
              Submit artwork
            </Link>
          )}
        </div>
        <div
          className="prose prose-sm max-w-none text-laf-muted"
          dangerouslySetInnerHTML={{ __html: effectiveMeta.rulesHtml }}
        />
        <div className="flex flex-wrap gap-3 text-xs text-laf-muted">
          <span
            className={`px-2.5 py-1 rounded-full ${phase.submissionsAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}
          >
            Submissions: {phase.submissionsAllowed ? "Open" : "Closed"}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full ${phase.votingAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}
          >
            Voting: {phase.votingAllowed ? "Open (Google login)" : "Closed"}
          </span>
        </div>
      </div>

      {winner && (
        <div className="rounded-2xl border-2 border-laf-gold bg-laf-cream/60 p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-laf-gold">Winner announced</p>
          <h3 className="mt-2 text-xl font-bold text-laf-navy">{winner.title}</h3>
          <p className="text-laf-muted">
            by {formatArtistPublicLine(winner)} · {winner.voteCount} public votes
          </p>
          <div className="relative mt-4 aspect-[4/3] max-w-md overflow-hidden rounded-xl border border-laf-border bg-white">
            <Image src={winner.imageUrl} alt={winner.title} fill className="object-contain" sizes="400px" unoptimized />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-laf-navy">Gallery</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value as AgeGroupId | "all")}
                className="px-3 py-1.5 rounded-lg text-sm border border-laf-border bg-white"
              >
                <option value="all">All age groups</option>
                {AGE_GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSort("votes")}
                className={`px-3 py-1.5 rounded-lg text-sm ${sort === "votes" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"}`}
              >
                Most votes
              </button>
              <button
                type="button"
                onClick={() => setSort("newest")}
                className={`px-3 py-1.5 rounded-lg text-sm ${sort === "newest" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"}`}
              >
                Newest
              </button>
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
            <p className="text-sm text-laf-muted">No approved entries in this category yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {sortedEntries.map((entry) => {
                const hasVoted = votedIds.has(entry.id);
                const canVote = phase.votingAllowed && voteUser && !hasVoted;
                return (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-laf-border bg-white overflow-hidden shadow-sm"
                  >
                    <div className="relative aspect-[4/3] bg-laf-cream/30">
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-laf-navy">{entry.title}</h4>
                        <p className="text-sm text-laf-muted">{formatArtistPublicLine(entry)}</p>
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
                          className="text-xs text-laf-muted hover:text-laf-navy underline"
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
        </div>

        <aside className="rounded-2xl border border-laf-border bg-white p-5 lg:sticky lg:top-24">
          <h3 className="font-semibold text-laf-navy mb-4">Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-laf-muted">No entries yet.</p>
          ) : (
            <ol className="space-y-3">
              {leaderboard.map((entry, i) => (
                <li key={entry.id} className="flex gap-3 text-sm">
                  <span className="font-bold text-laf-gold w-5 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-laf-navy truncate">{entry.title}</p>
                    <p className="text-laf-muted truncate">
                      {formatArtistPublicLine(entry)} · {entry.voteCount} votes
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      {reportEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleReport} className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-semibold text-laf-navy">Report entry</h3>
            <p className="text-sm text-laf-muted">{reportEntry.title}</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as DrawingReportReason)}
              className="w-full px-3 py-2 rounded-lg border border-laf-border"
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
              className="w-full px-3 py-2 rounded-lg border border-laf-border"
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
