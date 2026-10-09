"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  innovatorsAgeGroupLabel,
  isEventAdmin,
  type LafEventAdminEntry,
  youtubeEmbedUrl,
} from "@/lib/event-submissions";
import { getFirebaseAuth, getFirebaseConfig } from "@/lib/firebase";

type Filter = "all" | "pending" | "approved" | "removed";

export default function AdminInnovatorsApp() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [entries, setEntries] = useState<LafEventAdminEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [loading, setLoading] = useState(false);

  const isAdmin = isEventAdmin(user?.email);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  const loadEntries = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/innovators/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { entries?: LafEventAdminEntry[]; error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Could not load entries.");
        return;
      }
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setMsg("");
    } catch {
      setMsg("Could not load entries.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.status === filter);
  }, [entries, filter]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAuthError("Sign-in failed. Check email and password.");
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
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, status: action === "approve" ? "approved" : "removed" }
            : e
        )
      );
      setMsg(action === "approve" ? "Approved — now in gallery." : "Removed from gallery.");
    } catch {
      setMsg("Action failed.");
    } finally {
      setBusy("");
    }
  }

  if (!config) {
    return <p className="text-sm text-laf-muted">Firebase is not configured.</p>;
  }

  if (!user) {
    return (
      <form onSubmit={(e) => void signIn(e)} className="max-w-sm space-y-4">
        <p className="text-sm text-laf-muted">Sign in with the LAF admin account.</p>
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
          className="px-5 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold"
        >
          Sign in
        </button>
      </form>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-700">This account is not an event admin.</p>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-laf-muted">
            Signed in as {user.email} · Pending {counts.pending} · Approved {counts.approved} ·
            Removed {counts.removed}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadEntries()}
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

      {msg && <p className="text-sm text-laf-navy bg-laf-cream rounded-lg px-4 py-2">{msg}</p>}
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
                  <p className="text-xs font-semibold uppercase text-laf-gold">{entry.status}</p>
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
                  <img src={entry.photo1Url} alt="" className="rounded-lg object-cover aspect-video" />
                ) : null}
                {entry.photo2Url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.photo2Url} alt="" className="rounded-lg object-cover aspect-video" />
                ) : null}
              </div>
              {embed ? (
                <div className="aspect-video max-w-xl rounded-lg overflow-hidden bg-black">
                  <iframe
                    title={entry.title}
                    src={embed}
                    className="w-full h-full"
                    allowFullScreen
                  />
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
          <p className="text-sm text-laf-muted">No entries in this filter.</p>
        )}
      </div>
    </div>
  );
}
