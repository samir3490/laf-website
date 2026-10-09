"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import AdminInnovatorsAnalytics from "@/components/innovators/AdminInnovatorsAnalytics";
import {
  LAF_EVENT_COMPETITION_COLLECTION,
  normalizeEventCompetitionMeta,
  type EventCompetitionMeta,
  type InnovatorsAgeGroupId,
} from "@/lib/event-analytics";
import {
  INNOVATORS_AGE_GROUPS,
  innovatorsAgeGroupLabel,
  isEventAdmin,
  LAF_EVENT_SUBMISSIONS_COLLECTION,
  toAdminEventEntry,
  type LafEventAdminEntry,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
  youtubeEmbedUrl,
} from "@/lib/event-submissions";
import { getFirebaseAuth, getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";

type Filter = "all" | "pending" | "approved" | "removed";

export default function AdminInnovatorsApp() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [entries, setEntries] = useState<LafEventAdminEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(true);
  const [listenError, setListenError] = useState("");
  const [meta, setMeta] = useState<EventCompetitionMeta>(
    normalizeEventCompetitionMeta(undefined)
  );
  const [winnerPick, setWinnerPick] = useState<Partial<Record<InnovatorsAgeGroupId, string>>>({});

  const isAdmin = isEventAdmin(user?.email);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  const loadViaApi = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/innovators/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { entries?: LafEventAdminEntry[]; error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Could not load entries via API.");
        return;
      }
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setMsg(
        Array.isArray(data.entries) && data.entries.length === 0
          ? "No submissions found yet."
          : "Loaded via API."
      );
      setListenError("");
    } catch {
      setMsg("Could not load entries.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!db || !isAdmin) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setListenError("");
    const q = query(
      collection(db, LAF_EVENT_SUBMISSIONS_COLLECTION),
      where("eventSlug", "==", YOUNG_INNOVATORS_2026_EVENT_SLUG)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => toAdminEventEntry(d.id, d.data() as Record<string, unknown>))
          .filter((e): e is LafEventAdminEntry => e !== null)
          .sort((a, b) => {
            const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
            const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
            return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
          });
        setEntries(list);
        setLoading(false);
        setListenError("");
      },
      (err) => {
        console.error("[admin/innovators] firestore listen", err);
        setListenError(err.message || "Could not read submissions from Firestore.");
        setLoading(false);
        void loadViaApi();
      }
    );

    return () => unsub();
  }, [db, isAdmin, loadViaApi]);

  useEffect(() => {
    if (!db || !isAdmin) return;
    return onSnapshot(
      doc(db, LAF_EVENT_COMPETITION_COLLECTION, YOUNG_INNOVATORS_2026_EVENT_SLUG),
      (snap) => {
        const next = normalizeEventCompetitionMeta(snap.data() as Record<string, unknown> | undefined);
        setMeta(next);
        setWinnerPick(next.winnersByAgeGroup ?? {});
      }
    );
  }, [db, isAdmin]);

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.status === filter);
  }, [entries, filter]);

  const approvedByGroup = useMemo(() => {
    const map: Record<InnovatorsAgeGroupId, LafEventAdminEntry[]> = {
      ages_6_10: [],
      ages_11_16: [],
    };
    for (const e of entries) {
      if (e.status !== "approved") continue;
      if (e.ageGroup === "ages_6_10" || e.ageGroup === "ages_11_16") {
        map[e.ageGroup].push(e);
      }
    }
    for (const id of Object.keys(map) as InnovatorsAgeGroupId[]) {
      map[id].sort((a, b) => b.voteCount - a.voteCount);
    }
    return map;
  }, [entries]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthError("Sign-in failed. Use admin@agrawalfoundation.org (same as Drawing admin).");
    }
  }

  async function moderate(entryId: string, action: "approve" | "remove") {
    if (!user) return;
    setBusy(entryId + action);
    setMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/innovators/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entryId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Action failed.");
        return;
      }
      setMsg(action === "approve" ? "Approved — now in gallery." : "Removed from gallery.");
    } catch {
      setMsg("Action failed.");
    } finally {
      setBusy("");
    }
  }

  async function announceWinner(ageGroup: InnovatorsAgeGroupId, entryId: string) {
    if (!user || !entryId) return;
    setBusy(`winner-${ageGroup}`);
    setMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/innovators/admin/winner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ageGroup, entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Could not announce winner.");
        return;
      }
      setMsg(`Winner announced for ${innovatorsAgeGroupLabel(ageGroup)}.`);
    } catch {
      setMsg("Could not announce winner.");
    } finally {
      setBusy("");
    }
  }

  if (!config) {
    return <p className="text-sm text-laf-muted">Firebase is not configured.</p>;
  }

  if (!user) {
    return (
      <div className="max-w-sm space-y-4">
        <p className="text-sm text-laf-muted">
          Sign in with <strong>admin@agrawalfoundation.org</strong> (same account as Drawing
          Competition admin).
        </p>
        <GoogleSignInButton
          auth={auth}
          label="Sign in with Google"
          disabled={authBusy}
          onBusy={setAuthBusy}
          onError={setAuthError}
        />
        <p className="text-xs text-laf-muted text-center">or use email and password</p>
        <form onSubmit={(e) => void signIn(e)} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
          />
          {authError && <p className="text-sm text-red-700">{authError}</p>}
          <button
            type="submit"
            disabled={authBusy}
            className="w-full px-5 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold disabled:opacity-60"
          >
            Sign in with email
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">
          Signed in as {user.email}, but this account is not the event admin. Use
          admin@agrawalfoundation.org.
        </p>
        <button
          type="button"
          onClick={() => auth && signOut(auth)}
          className="text-sm text-laf-gold hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  const counts = {
    pending: entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    removed: entries.filter((e) => e.status === "removed").length,
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-laf-muted">
          Signed in as {user.email} · Pending {counts.pending} · Approved {counts.approved} ·
          Removed {counts.removed} · Total {entries.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadViaApi()}
            className="px-3 py-2 rounded-lg border border-laf-border text-sm"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => auth && signOut(auth)}
            className="px-3 py-2 text-sm text-laf-muted hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>

      {listenError && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          Live sync issue: {listenError}. Try Refresh. Confirm Firestore rules for{" "}
          <code>laf_event_submissions</code> and <code>laf_event_analytics_events</code> are
          published.
        </p>
      )}
      {msg && <p className="text-sm text-laf-navy bg-laf-cream rounded-lg px-4 py-2">{msg}</p>}

      <AdminInnovatorsAnalytics entries={entries} />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-laf-navy">Announce winners</h2>
          <p className="mt-1 text-sm text-laf-muted">
            Pick an approved entry per age group (same idea as Drawing Competition admin).
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {INNOVATORS_AGE_GROUPS.map((group) => {
            const list = approvedByGroup[group.id];
            const currentWinnerId = meta.winnersByAgeGroup?.[group.id];
            const currentWinner = list.find((e) => e.id === currentWinnerId);
            return (
              <div key={group.id} className="rounded-2xl border border-laf-border bg-white p-5 space-y-3">
                <h3 className="font-semibold text-laf-navy">{group.label}</h3>
                {currentWinner ? (
                  <p className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2">
                    Current winner: <strong>{currentWinner.title}</strong> ({currentWinner.childName}
                    , {currentWinner.voteCount} votes)
                  </p>
                ) : (
                  <p className="text-xs text-laf-muted">No winner announced yet.</p>
                )}
                <select
                  value={winnerPick[group.id] ?? ""}
                  onChange={(e) =>
                    setWinnerPick((prev) => ({ ...prev, [group.id]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
                >
                  <option value="">Select approved entry…</option>
                  {list.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} — {e.childName} ({e.voteCount} votes)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!winnerPick[group.id] || !!busy}
                  onClick={() =>
                    winnerPick[group.id] && void announceWinner(group.id, winnerPick[group.id]!)
                  }
                  className="px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-50"
                >
                  Announce winner
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-laf-navy">Submissions</h2>
          <p className="mt-1 text-sm text-laf-muted">
            Review pending projects, approve for the gallery, or remove.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["pending", "approved", "removed", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                filter === f ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-laf-muted">Loading…</p>}

        <div className="space-y-4">
          {filtered.map((entry) => {
            const embed = entry.videoUrl ? youtubeEmbedUrl(entry.videoUrl) : null;
            return (
              <article
                key={entry.id}
                className="rounded-2xl border border-laf-border bg-white p-4 md:p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-laf-gold">
                      {entry.status}
                      {entry.trafficSource ? ` · ${entry.trafficSource}` : ""}
                    </p>
                    <h3 className="font-bold text-laf-navy">{entry.title}</h3>
                    <p className="text-sm text-laf-muted">
                      {entry.childName} · age {entry.childAge} · {entry.childCity} ·{" "}
                      {innovatorsAgeGroupLabel(entry.ageGroup)} · {entry.voteCount} votes
                    </p>
                    <p className="text-xs text-laf-muted mt-1">
                      Contact: {entry.contactName} · {entry.contactEmail} · {entry.contactPhone}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.status !== "approved" && (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void moderate(entry.id, "approve")}
                        className="px-3 py-2 rounded-lg bg-green-700 text-white text-xs font-semibold disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {entry.status !== "removed" && (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void moderate(entry.id, "remove")}
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-800 text-xs font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-laf-muted whitespace-pre-wrap">{entry.description}</p>
                <div className={`grid gap-2 ${entry.photo2Url ? "sm:grid-cols-2" : ""}`}>
                  {entry.photo1Url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photo1Url}
                      alt=""
                      className="rounded-lg object-cover aspect-video"
                    />
                  ) : null}
                  {entry.photo2Url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photo2Url}
                      alt=""
                      className="rounded-lg object-cover aspect-video"
                    />
                  ) : null}
                </div>
                {embed ? (
                  <div className="aspect-video max-w-xl rounded-lg overflow-hidden bg-black">
                    <iframe title={entry.title} src={embed} className="w-full h-full" allowFullScreen />
                  </div>
                ) : entry.videoUrl ? (
                  <a
                    href={entry.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-laf-gold hover:underline"
                  >
                    Open video link
                  </a>
                ) : (
                  <p className="text-xs text-laf-muted">No video link</p>
                )}
                <p className="text-xs text-laf-muted break-all">ID: {entry.id}</p>
              </article>
            );
          })}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-laf-muted">No entries in this filter ({filter}).</p>
          )}
        </div>
      </section>
    </div>
  );
}
