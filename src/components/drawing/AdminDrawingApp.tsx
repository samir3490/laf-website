"use client";

import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import Image from "next/image";
import {
  ageGroupLabel,
  combinedEntryScore,
  DEFAULT_COMPETITION_META,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_ENTRIES_COLLECTION,
  DRAWING_META_DOC_ID,
  DRAWING_REPORTS_COLLECTION,
  isDrawingAdmin,
  normalizeCompetitionMeta,
  normalizeDrawingEntryAdmin,
  type AgeGroupId,
  type DrawingCompetitionMeta,
  type DrawingEntryAdmin,
} from "@/lib/drawing";
import { getFirebaseAuth, getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";

function toEntry(snap: QueryDocumentSnapshot): DrawingEntryAdmin | null {
  return normalizeDrawingEntryAdmin(snap.data() as Record<string, unknown>, snap.id);
}

export default function AdminDrawingApp() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const [meta, setMeta] = useState<DrawingCompetitionMeta>(DEFAULT_COMPETITION_META);
  const [entries, setEntries] = useState<DrawingEntryAdmin[]>([]);
  const [openReports, setOpenReports] = useState(0);
  const [winnerPick, setWinnerPick] = useState("");
  const [winnerAgeGroup, setWinnerAgeGroup] = useState<AgeGroupId | "all">("all");
  const [judgeScores, setJudgeScores] = useState<Record<string, string>>({});

  const isAdmin = isDrawingAdmin(user?.email);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  useEffect(() => {
    if (!db || !isAdmin) return;

    const metaUnsub = onSnapshot(doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID), (snap) => {
      const next = normalizeCompetitionMeta(snap.data() as Record<string, unknown> | undefined);
      setMeta(next);
      if (next.winnerEntryId) setWinnerPick(next.winnerEntryId);
    });

    const entriesUnsub = onSnapshot(
      query(collection(db, DRAWING_ENTRIES_COLLECTION), orderBy("createdAt", "desc")),
      (snap) => {
        const list = snap.docs.map(toEntry).filter((e): e is DrawingEntryAdmin => e !== null);
        setEntries(list);
        const scores: Record<string, string> = {};
        list.forEach((e) => {
          if (e.judgeScore != null) scores[e.id] = String(e.judgeScore);
        });
        setJudgeScores(scores);
      }
    );

    const reportsUnsub = onSnapshot(collection(db, DRAWING_REPORTS_COLLECTION), (snap) => {
      setOpenReports(snap.docs.filter((d) => d.data().status === "open").length);
    });

    return () => {
      metaUnsub();
      entriesUnsub();
      reportsUnsub();
    };
  }, [db, isAdmin]);

  const pendingEntries = useMemo(() => entries.filter((e) => e.status === "pending"), [entries]);
  const activeEntries = useMemo(() => entries.filter((e) => e.status === "active"), [entries]);
  const maxVotes = useMemo(
    () => Math.max(1, ...activeEntries.map((e) => e.voteCount)),
    [activeEntries]
  );

  const rankedActive = useMemo(() => {
    const list = [...activeEntries];
    list.sort(
      (a, b) =>
        combinedEntryScore(b, meta, maxVotes) - combinedEntryScore(a, meta, maxVotes) ||
        b.voteCount - a.voteCount
    );
    return list;
  }, [activeEntries, meta, maxVotes]);

  const topCombined = useMemo(() => {
    if (winnerAgeGroup === "all") return rankedActive[0] ?? null;
    return rankedActive.find((e) => e.ageGroup === winnerAgeGroup) ?? null;
  }, [rankedActive, winnerAgeGroup]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthError("Sign in failed. Check your email and password.");
    }
  }

  async function adminFetch(path: string, body: Record<string, unknown>) {
    if (!user) return null;
    const token = await user.getIdToken();
    const res = await fetch(path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "Request failed.");
      return null;
    }
    return data;
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy("meta");
    setMsg("");
    try {
      await setDoc(
        doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID),
        { ...meta, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setMsg("Competition settings saved.");
    } catch {
      setMsg("Failed to save settings.");
    } finally {
      setBusy("");
    }
  }

  async function moderateEntry(entryId: string, action: "approve" | "reject") {
    setBusy(entryId);
    setMsg("");
    const result = await adminFetch("/api/drawing/admin/approve", { entryId, action });
    if (result) setMsg(action === "approve" ? "Entry approved and published." : "Entry rejected.");
    setBusy("");
  }

  async function saveJudgeScore(entryId: string) {
    const raw = judgeScores[entryId];
    const score = Number(raw);
    if (!Number.isFinite(score)) {
      setMsg("Enter a judge score from 0 to 100.");
      return;
    }
    setBusy(`score-${entryId}`);
    setMsg("");
    const result = await adminFetch("/api/drawing/admin/judge-score", { entryId, judgeScore: score });
    if (result) setMsg("Judge score saved.");
    setBusy("");
  }

  async function removeEntry(entryId: string) {
    if (!confirm("Remove this entry from the public gallery?")) return;
    setBusy(entryId);
    setMsg("");
    const result = await adminFetch("/api/drawing/admin/remove", { entryId });
    if (result) setMsg("Entry removed.");
    setBusy("");
  }

  async function announceWinner(useTop: boolean) {
    if (!db) return;
    const entryId = useTop ? topCombined?.id : winnerPick;
    if (!entryId) {
      setMsg("Select an entry to announce as winner.");
      return;
    }
    setBusy("winner");
    setMsg("");
    try {
      await setDoc(
        doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID),
        {
          winnerEntryId: entryId,
          winnerAnnouncedAt: new Date().toISOString(),
          votingOpen: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setMsg("Winner announced and voting closed.");
    } catch {
      setMsg("Failed to announce winner.");
    } finally {
      setBusy("");
    }
  }

  if (!config) {
    return <p className="text-sm text-laf-muted">Firebase configuration missing.</p>;
  }

  if (!user || !isAdmin) {
    return (
      <form onSubmit={handleLogin} className="max-w-md space-y-4 rounded-2xl border border-laf-border bg-white p-6">
        <p className="text-sm text-laf-muted">Sign in with your LAF admin account.</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-laf-border"
        />
        {authError && <p className="text-sm text-red-600">{authError}</p>}
        <button type="submit" className="px-5 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold">
          Sign in
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-laf-muted">Signed in as {user.email}</p>
        <button type="button" onClick={() => auth && signOut(auth)} className="text-sm text-laf-gold hover:underline">
          Sign out
        </button>
      </div>

      {msg && <p className="text-sm text-laf-navy bg-laf-cream/60 rounded-lg px-4 py-2">{msg}</p>}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">
          Pending review ({pendingEntries.length})
        </h2>
        {openReports > 0 && (
          <p className="text-sm text-amber-800">
            {openReports} open report{openReports === 1 ? "" : "s"} — review below.
          </p>
        )}
        {pendingEntries.length === 0 ? (
          <p className="text-sm text-laf-muted">No submissions awaiting approval.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-amber-200 bg-white overflow-hidden">
                <div className="relative aspect-video bg-laf-cream/30">
                  <Image src={entry.imageUrl} alt={entry.title} fill className="object-contain" unoptimized />
                </div>
                <div className="p-3 space-y-2 text-sm">
                  <p className="font-medium text-laf-navy">{entry.title}</p>
                  <p className="text-xs text-laf-muted">
                    {entry.artistName} · {ageGroupLabel(entry.ageGroup)}
                  </p>
                  <p className="text-xs text-laf-muted">
                    Parent: {entry.parentName} · {entry.parentEmail} · {entry.parentPhone}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busy === entry.id}
                      onClick={() => moderateEntry(entry.id, "approve")}
                      className="text-xs font-semibold text-green-700 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy === entry.id}
                      onClick={() => moderateEntry(entry.id, "reject")}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-laf-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">Competition settings</h2>
        <form onSubmit={saveMeta} className="space-y-4 max-w-2xl">
          <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            placeholder="Competition title"
            className="w-full px-4 py-2 rounded-lg border border-laf-border"
          />
          <input
            type="text"
            value={meta.theme}
            onChange={(e) => setMeta({ ...meta, theme: e.target.value })}
            placeholder="Theme"
            className="w-full px-4 py-2 rounded-lg border border-laf-border"
          />
          <textarea
            value={meta.rulesHtml}
            onChange={(e) => setMeta({ ...meta, rulesHtml: e.target.value })}
            rows={4}
            placeholder="Rules (HTML allowed)"
            className="w-full px-4 py-2 rounded-lg border border-laf-border font-mono text-sm"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={meta.submissionOpen}
                onChange={(e) => setMeta({ ...meta, submissionOpen: e.target.checked })}
              />
              Submissions open
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={meta.votingOpen}
                onChange={(e) => setMeta({ ...meta, votingOpen: e.target.checked })}
              />
              Voting open
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-laf-muted mb-1">Judge weight (0–1)</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={meta.judgeWeight ?? 0.7}
                onChange={(e) => setMeta({ ...meta, judgeWeight: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-laf-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-laf-muted mb-1">Public vote weight (0–1)</label>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={meta.publicVoteWeight ?? 0.3}
                onChange={(e) => setMeta({ ...meta, publicVoteWeight: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-laf-border text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy === "meta"}
            className="px-5 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy === "meta" ? "Saving…" : "Save settings"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-laf-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">Announce winner</h2>
        <p className="text-sm text-laf-muted">
          Combined score = {(meta.judgeWeight ?? 0.7) * 100}% judge +{" "}
          {(meta.publicVoteWeight ?? 0.3) * 100}% public votes (normalized).
        </p>
        {topCombined && (
          <p className="text-sm text-laf-muted">
            Top combined ({winnerAgeGroup === "all" ? "all ages" : ageGroupLabel(winnerAgeGroup)}):{" "}
            <strong>{topCombined.title}</strong> — score{" "}
            {(combinedEntryScore(topCombined, meta, maxVotes) * 100).toFixed(1)} · {topCombined.voteCount} votes
            {topCombined.judgeScore != null ? ` · judge ${topCombined.judgeScore}/100` : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-laf-muted mb-1">Age group for auto-pick</label>
            <select
              value={winnerAgeGroup}
              onChange={(e) => setWinnerAgeGroup(e.target.value as AgeGroupId | "all")}
              className="px-3 py-2 rounded-lg border border-laf-border text-sm"
            >
              <option value="all">All ages</option>
              <option value="under_6">Under 6</option>
              <option value="7_10">7–10</option>
              <option value="11_14">11–14</option>
              <option value="15_18">15–18</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-laf-muted mb-1">Pick winner manually</label>
            <select
              value={winnerPick}
              onChange={(e) => setWinnerPick(e.target.value)}
              className="px-3 py-2 rounded-lg border border-laf-border text-sm min-w-[220px]"
            >
              <option value="">Select entry…</option>
              {activeEntries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({ageGroupLabel(e.ageGroup)})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={busy === "winner"}
            onClick={() => announceWinner(false)}
            className="px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
          >
            Announce selected
          </button>
          <button
            type="button"
            disabled={busy === "winner" || !topCombined}
            onClick={() => announceWinner(true)}
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium disabled:opacity-60"
          >
            Announce top combined score
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">Published entries ({activeEntries.length})</h2>
        {activeEntries.length === 0 ? (
          <p className="text-sm text-laf-muted">No approved entries yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-laf-border bg-white overflow-hidden">
                <div className="relative aspect-video bg-laf-cream/30">
                  <Image src={entry.imageUrl} alt={entry.title} fill className="object-contain" unoptimized />
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium text-sm text-laf-navy">{entry.title}</p>
                  <p className="text-xs text-laf-muted">
                    {entry.artistName} · {ageGroupLabel(entry.ageGroup)} · {entry.voteCount} votes
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Judge /100"
                      value={judgeScores[entry.id] ?? ""}
                      onChange={(e) => setJudgeScores((s) => ({ ...s, [entry.id]: e.target.value }))}
                      className="w-20 px-2 py-1 rounded border border-laf-border text-xs"
                    />
                    <button
                      type="button"
                      disabled={busy === `score-${entry.id}`}
                      onClick={() => saveJudgeScore(entry.id)}
                      className="text-xs text-laf-gold font-medium hover:underline"
                    >
                      Save score
                    </button>
                    <button
                      type="button"
                      disabled={busy === entry.id}
                      onClick={() => removeEntry(entry.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
