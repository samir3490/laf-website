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
  DEFAULT_COMPETITION_META,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_ENTRIES_COLLECTION,
  DRAWING_META_DOC_ID,
  DRAWING_REPORTS_COLLECTION,
  isDrawingAdmin,
  normalizeCompetitionMeta,
  normalizeDrawingEntry,
  type DrawingCompetitionMeta,
  type DrawingEntry,
} from "@/lib/drawing";
import { getFirebaseAuth, getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";

function toEntry(snap: QueryDocumentSnapshot): DrawingEntry | null {
  return normalizeDrawingEntry(snap.data() as Record<string, unknown>, snap.id);
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
  const [entries, setEntries] = useState<DrawingEntry[]>([]);
  const [openReports, setOpenReports] = useState(0);
  const [winnerPick, setWinnerPick] = useState("");

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
      query(collection(db, DRAWING_ENTRIES_COLLECTION), orderBy("voteCount", "desc")),
      (snap) => {
        const list = snap.docs.map(toEntry).filter((e): e is DrawingEntry => e !== null);
        setEntries(list);
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

  const activeEntries = useMemo(() => entries.filter((e) => e.status === "active"), [entries]);
  const topEntry = activeEntries[0] ?? null;

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

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy("meta");
    setMsg("");
    try {
      await setDoc(
        doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID),
        {
          ...meta,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setMsg("Competition settings saved.");
    } catch {
      setMsg("Failed to save settings.");
    } finally {
      setBusy("");
    }
  }

  async function removeEntry(entryId: string) {
    if (!auth || !user) return;
    if (!confirm("Remove this entry from the public gallery?")) return;
    setBusy(entryId);
    setMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/drawing/admin/remove", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Remove failed.");
        return;
      }
      setMsg("Entry removed.");
    } catch {
      setMsg("Remove failed.");
    } finally {
      setBusy("");
    }
  }

  async function announceWinner(useTop: boolean) {
    if (!db) return;
    const entryId = useTop ? topEntry?.id : winnerPick;
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
        <button
          type="button"
          onClick={() => auth && signOut(auth)}
          className="text-sm text-laf-gold hover:underline"
        >
          Sign out
        </button>
      </div>

      {msg && <p className="text-sm text-laf-navy bg-laf-cream/60 rounded-lg px-4 py-2">{msg}</p>}

      <section className="rounded-2xl border border-laf-border bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">Competition settings</h2>
        {openReports > 0 && (
          <p className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
            {openReports} open report{openReports === 1 ? "" : "s"} — review entries below.
          </p>
        )}
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
              <label className="block text-xs text-laf-muted mb-1">Submission ends (optional)</label>
              <input
                type="datetime-local"
                value={meta.submissionEndsAt?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    submissionEndsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-laf-border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-laf-muted mb-1">Voting ends (optional)</label>
              <input
                type="datetime-local"
                value={meta.votingEndsAt?.slice(0, 16) ?? ""}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    votingEndsAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
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
        {topEntry && (
          <p className="text-sm text-laf-muted">
            Current leader: <strong>{topEntry.title}</strong> by {topEntry.artistName} ({topEntry.voteCount} votes)
          </p>
        )}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-laf-muted mb-1">Pick winner</label>
            <select
              value={winnerPick}
              onChange={(e) => setWinnerPick(e.target.value)}
              className="px-3 py-2 rounded-lg border border-laf-border text-sm min-w-[220px]"
            >
              <option value="">Select entry…</option>
              {activeEntries.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.voteCount} votes)
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
            disabled={busy === "winner" || !topEntry}
            onClick={() => announceWinner(true)}
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium disabled:opacity-60"
          >
            Announce top votes
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-laf-navy">Entries ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-laf-muted">No entries yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-xl border overflow-hidden ${entry.status === "removed" ? "opacity-60 border-red-200" : "border-laf-border bg-white"}`}
              >
                <div className="relative aspect-video bg-laf-cream/30">
                  <Image src={entry.imageUrl} alt={entry.title} fill className="object-contain" unoptimized />
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-medium text-sm text-laf-navy">{entry.title}</p>
                  <p className="text-xs text-laf-muted">
                    {entry.artistName} · {entry.voteCount} votes · {entry.status}
                  </p>
                  {entry.status === "active" && (
                    <button
                      type="button"
                      disabled={busy === entry.id}
                      onClick={() => removeEntry(entry.id)}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
