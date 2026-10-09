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
import {
  entryCreatedAtMs,
  formatChildPublicLine,
  INNOVATORS_AGE_GROUPS,
  innovatorsAgeGroupLabel,
  LAF_EVENT_REPORT_REASONS,
  leaderboardByAgeGroup,
  type InnovatorsAgeGroupId,
  type LafEventPublicEntry,
  type LafEventReportReason,
  youtubeEmbedUrl,
} from "@/lib/event-submissions";
import { getFirebaseAuth, getFirebaseConfig } from "@/lib/firebase";
import { isYoungInnovatorsOpen, YOUNG_INNOVATORS_DATES } from "@/lib/young-innovators";

type SortMode = "votes" | "newest";

export default function YoungInnovatorsGallery() {
  const searchParams = useSearchParams();
  const submittedPending = searchParams.get("submitted") === "pending";
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const votingOpen = useMemo(() => isYoungInnovatorsOpen(), []);

  const [entries, setEntries] = useState<LafEventPublicEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState("");
  const [sort, setSort] = useState<SortMode>("votes");
  const [ageFilter, setAgeFilter] = useState<InnovatorsAgeGroupId | "all">("all");
  const [voteUser, setVoteUser] = useState<User | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportEntry, setReportEntry] = useState<LafEventPublicEntry | null>(null);
  const [reportReason, setReportReason] = useState<LafEventReportReason>("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportMsg, setReportMsg] = useState("");
  const thanksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submittedPending) return;
    const el = thanksRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [submittedPending]);

  const loadEntries = useCallback(async () => {
    setEntriesError("");
    try {
      const res = await fetch("/api/innovators/entries");
      const data = (await res.json()) as { entries?: LafEventPublicEntry[]; error?: string };
      if (!res.ok) {
        setEntriesError(data.error ?? "Could not load projects.");
        setEntries([]);
        return;
      }
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setEntriesError("Could not load projects. Check your connection and try again.");
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  const loadMyVotes = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/innovators/my-votes", {
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
    async (entry: LafEventPublicEntry) => {
      if (!votingOpen) {
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
        const res = await fetch("/api/innovators/vote", {
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
    [votingOpen, voteUser, votedIds]
  );

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportEntry) return;
    setReportBusy(true);
    setReportMsg("");
    try {
      const res = await fetch("/api/innovators/report", {
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
        <h3 className="font-semibold text-laf-navy text-sm">How to vote</h3>
        <p className="text-xs text-laf-muted leading-relaxed">
          {voteUser
            ? `Signed in as ${voteUser.displayName || voteUser.email}. One Google account = one vote per project.`
            : "Sign in with Google to vote — no password for browsing. Anyone can view projects."}
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
              disabled={authBusy || !auth || !votingOpen}
              onClick={() => void signInToVote()}
              className="w-full px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
            >
              {authBusy ? "Signing in…" : "Sign in with Google to vote"}
            </button>
          )}
          <Link
            href="/events/young-innovators/submit"
            className="w-full text-center px-4 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold hover:bg-laf-navy/90 transition-colors"
          >
            Submit a project
          </Link>
        </div>
        {voteMsg && <p className="text-xs text-red-700">{voteMsg}</p>}
      </div>

      <div className="rounded-2xl border border-laf-border bg-white p-4">
        <h3 className="font-semibold text-laf-navy text-sm mb-3">Top by age group</h3>
        <div className="space-y-4">
          {INNOVATORS_AGE_GROUPS.map((group) => {
            const top = categoryLeaderboard[group.id] ?? [];
            return (
              <div key={group.id}>
                <p className="text-xs font-semibold text-laf-gold uppercase tracking-wide mb-2">
                  {group.label}
                </p>
                {top.length === 0 ? (
                  <p className="text-xs text-laf-muted">No approved entries yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {top.map((entry, i) => (
                      <li key={entry.id} className="flex gap-2 text-xs">
                        <span className="font-bold text-laf-navy w-4 shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-laf-navy truncate">{entry.title}</p>
                          <p className="text-laf-muted truncate">
                            {entry.childName} · {entry.voteCount} votes
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
      {submittedPending && (
        <div
          ref={thanksRef}
          tabIndex={-1}
          className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-laf-navy scroll-mt-28"
        >
          Thank you! Your project was received and is <strong>pending LAF review</strong>. It will
          appear here after approval. We email a certificate for valid entries.
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
        <div className="order-1 lg:hidden">{sidebar}</div>

        <main className="order-2 lg:order-1 space-y-6 min-w-0">
          <div className="rounded-2xl border border-laf-border bg-white p-5 lg:p-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">
              {YOUNG_INNOVATORS_DATES.label}
            </p>
            <h2 className="text-xl lg:text-2xl font-bold text-laf-navy">Project gallery</h2>
            <p className="text-sm text-laf-muted leading-relaxed">
              Browse approved projects from ages 6–16. Sign in with Google to vote (one vote per
              project). Contact details are never shown publicly.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span
                className={`px-2.5 py-1 rounded-full ${votingOpen ? "bg-green-100 text-green-800" : "bg-gray-100 text-laf-muted"}`}
              >
                Voting: {votingOpen ? "Open" : "Closed"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs text-laf-muted">Age group</label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value as InnovatorsAgeGroupId | "all")}
              className="rounded-lg border border-laf-border px-3 py-2 text-sm"
            >
              <option value="all">All ages</option>
              {INNOVATORS_AGE_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <label className="text-xs text-laf-muted ml-2">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="rounded-lg border border-laf-border px-3 py-2 text-sm"
            >
              <option value="votes">Most votes</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {entriesLoading && <p className="text-sm text-laf-muted">Loading projects…</p>}
          {entriesError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {entriesError}
            </p>
          )}
          {!entriesLoading && !entriesError && sortedEntries.length === 0 && (
            <div className="rounded-2xl border border-laf-border bg-laf-cream/40 p-8 text-center text-sm text-laf-muted">
              No approved projects yet. Be the first to{" "}
              <Link href="/events/young-innovators/submit" className="text-laf-gold font-medium hover:underline">
                submit
              </Link>
              .
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            {sortedEntries.map((entry) => {
              const embed = youtubeEmbedUrl(entry.videoUrl);
              const open = expandedId === entry.id;
              const voted = votedIds.has(entry.id);
              return (
                <article
                  key={entry.id}
                  className="rounded-2xl border border-laf-border bg-white overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-laf-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.photo1Url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <p className="text-xs font-semibold text-laf-gold">
                      {innovatorsAgeGroupLabel(entry.ageGroup)}
                    </p>
                    <h3 className="font-bold text-laf-navy leading-snug">{entry.title}</h3>
                    <p className="text-xs text-laf-muted">{formatChildPublicLine(entry)}</p>
                    <p className="text-sm text-laf-muted line-clamp-3">{entry.description}</p>
                    <p className="text-xs text-laf-navy font-medium">{entry.voteCount} votes</p>
                    <div className="mt-auto pt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!votingOpen || voted || votingId === entry.id}
                        onClick={() => void handleVote(entry)}
                        className="px-3 py-2 rounded-lg bg-laf-gold text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {voted ? "Voted" : votingId === entry.id ? "…" : "Vote"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : entry.id)}
                        className="px-3 py-2 rounded-lg border border-laf-border text-xs font-medium text-laf-navy"
                      >
                        {open ? "Hide details" : "Photos & video"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReportEntry(entry);
                          setReportMsg("");
                        }}
                        className="px-3 py-2 text-xs text-laf-muted hover:underline"
                      >
                        Report
                      </button>
                    </div>
                    {open && (
                      <div className="pt-3 space-y-3 border-t border-laf-border mt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={entry.photo1Url} alt="" className="rounded-lg object-cover aspect-square" />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={entry.photo2Url} alt="" className="rounded-lg object-cover aspect-square" />
                        </div>
                        {embed ? (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                              title={`Video: ${entry.title}`}
                              src={embed}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a
                            href={entry.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-sm text-laf-gold font-medium hover:underline"
                          >
                            Watch video (opens in new tab)
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        <div className="order-3 hidden lg:block">{sidebar}</div>
      </div>

      {reportEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form
            onSubmit={(e) => void handleReport(e)}
            className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-lg"
          >
            <h3 className="font-bold text-laf-navy">Report this project</h3>
            <p className="text-sm text-laf-muted">{reportEntry.title}</p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as LafEventReportReason)}
              className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
            >
              {LAF_EVENT_REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Optional details"
              className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
            />
            {reportMsg && <p className="text-sm text-laf-navy">{reportMsg}</p>}
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
                className="px-4 py-2 rounded-lg bg-laf-navy text-white text-sm font-semibold disabled:opacity-60"
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
