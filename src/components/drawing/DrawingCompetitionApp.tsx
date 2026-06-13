"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  competitionPhase,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_ENTRIES_COLLECTION,
  DRAWING_META_DOC_ID,
  DRAWING_VOTED_STORAGE_KEY,
  formatArtistPublicLine,
  normalizeCompetitionMeta,
  normalizeDrawingEntry,
  type DrawingCompetitionMeta,
  type DrawingEntry,
  type DrawingReportReason,
} from "@/lib/drawing";
import {
  getFirebaseConfig,
  getFirebaseDb,
} from "@/lib/firebase";
import { trackDrawingVote } from "@/lib/gtag";

type SortMode = "votes" | "newest";

const REPORT_REASONS: { value: DrawingReportReason; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "not_original", label: "Not original work" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

function readVotedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DRAWING_VOTED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function storeVotedId(entryId: string) {
  const ids = readVotedIds();
  ids.add(entryId);
  localStorage.setItem(DRAWING_VOTED_STORAGE_KEY, JSON.stringify([...ids]));
}

export default function DrawingCompetitionApp() {
  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";
  const config = getFirebaseConfig();
  const db = getFirebaseDb();

  const [meta, setMeta] = useState<DrawingCompetitionMeta | null>(null);
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [sort, setSort] = useState<SortMode>("votes");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState("");
  const [reportEntry, setReportEntry] = useState<DrawingEntry | null>(null);
  const [reportReason, setReportReason] = useState<DrawingReportReason>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    setVotedIds(readVotedIds());
  }, []);

  useEffect(() => {
    if (!db) return;

    const metaUnsub = onSnapshot(doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID), (snap) => {
      setMeta(normalizeCompetitionMeta(snap.data() as Record<string, unknown> | undefined));
    });

    const entriesUnsub = onSnapshot(
      query(collection(db, DRAWING_ENTRIES_COLLECTION), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs
          .map((d) => normalizeDrawingEntry(d.data() as Record<string, unknown>, d.id))
          .filter((e): e is DrawingEntry => e !== null && e.status === "active");
        setEntries(list);
      }
    );

    return () => {
      metaUnsub();
      entriesUnsub();
    };
  }, [db]);

  const phase = useMemo(
    () => competitionPhase(meta ?? { submissionOpen: true, votingOpen: true, title: "", theme: "", rulesHtml: "" }),
    [meta]
  );

  const sortedEntries = useMemo(() => {
    const list = [...entries];
    if (sort === "votes") {
      list.sort((a, b) => b.voteCount - a.voteCount || (b.createdAt?.toDate?.()?.getTime() ?? 0) - (a.createdAt?.toDate?.()?.getTime() ?? 0));
    }
    return list;
  }, [entries, sort]);

  const leaderboard = useMemo(() => sortedEntries.slice(0, 10), [sortedEntries]);
  const winner = useMemo(
    () => (meta?.winnerEntryId ? entries.find((e) => e.id === meta.winnerEntryId) : null),
    [entries, meta?.winnerEntryId]
  );

  const handleVote = useCallback(
    async (entry: DrawingEntry) => {
      if (!phase.votingAllowed) {
        setVoteMsg("Voting is closed.");
        return;
      }
      if (votedIds.has(entry.id)) return;

      setVotingId(entry.id);
      setVoteMsg("");
      try {
        const res = await fetch("/api/drawing/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: entry.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setVoteMsg(data.error ?? "Vote failed.");
          return;
        }
        if (!data.alreadyVoted) {
          trackDrawingVote(entry.id);
          storeVotedId(entry.id);
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
    [phase.votingAllowed, votedIds]
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

  if (!config || !db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-laf-navy font-semibold">Setup required</p>
        <p className="mt-2 text-sm text-laf-muted">Firebase environment variables are missing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {submitted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-laf-navy">
          Your artwork was posted successfully. Share the gallery so friends can vote!
        </div>
      )}

      {meta && (
        <div className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-laf-navy">{meta.title}</h2>
              {meta.theme && <p className="mt-1 text-laf-muted">Theme: {meta.theme}</p>}
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
            dangerouslySetInnerHTML={{ __html: meta.rulesHtml }}
          />
          <div className="flex flex-wrap gap-3 text-xs text-laf-muted">
            <span className={`px-2.5 py-1 rounded-full ${phase.submissionsAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
              Submissions: {phase.submissionsAllowed ? "Open" : "Closed"}
            </span>
            <span className={`px-2.5 py-1 rounded-full ${phase.votingAllowed ? "bg-green-100 text-green-800" : "bg-gray-100"}`}>
              Voting: {phase.votingAllowed ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      )}

      {winner && (
        <div className="rounded-2xl border-2 border-laf-gold bg-laf-cream/60 p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-laf-gold">Winner announced</p>
          <h3 className="mt-2 text-xl font-bold text-laf-navy">{winner.title}</h3>
          <p className="text-laf-muted">
            by {formatArtistPublicLine(winner)} · {winner.voteCount} votes
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
            <div className="flex gap-2">
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

          {sortedEntries.length === 0 ? (
            <p className="text-sm text-laf-muted">No entries yet. Be the first to submit!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {sortedEntries.map((entry) => {
                const hasVoted = votedIds.has(entry.id);
                const canVote = phase.votingAllowed && !hasVoted;
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
                        <button
                          type="button"
                          disabled={!canVote || votingId === entry.id}
                          onClick={() => handleVote(entry)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-laf-gold text-white hover:bg-laf-gold-bright disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {hasVoted ? "Voted" : votingId === entry.id ? "…" : "Vote"}
                        </button>
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
          <form
            onSubmit={handleReport}
            className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-xl"
          >
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
              <button
                type="button"
                onClick={() => setReportEntry(null)}
                className="px-4 py-2 text-sm text-laf-muted"
              >
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
