"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseConfig,
  getFirebaseDb,
  SCRATCH_GAMES_COLLECTION,
  SCRATCH_USERS_COLLECTION,
} from "@/lib/firebase";
import {
  formatGameDate,
  parseScratchProjectId,
  scratchEmbedCode,
  scratchEmbedUrl,
  scratchProjectUrl,
  type ScratchGame,
} from "@/lib/scratch";

type Tab = "browse" | "my-games" | "account";

export default function ScratchGamesApp() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<ScratchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>("browse");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [globalMsg, setGlobalMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [playGame, setPlayGame] = useState<ScratchGame | null>(null);
  const [editId, setEditId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setTab("my-games");
      else setTab("browse");
    });
  }, [auth]);

  const firebaseReady = !!(config && auth && db);

  const loadGames = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/scratch/games");
      const data = (await res.json()) as { games?: ScratchGame[]; error?: string };
      if (!res.ok) {
        setLoadError(data.error ?? "Could not load games.");
        setGames([]);
        return;
      }
      setGames(Array.isArray(data.games) ? data.games : []);
    } catch {
      setLoadError("Could not load games. Check your connection and try again.");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  if (!firebaseReady && tab !== "browse") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-laf-navy">Scratch Games setup required</h2>
        <p className="mt-2 text-sm text-laf-muted">
          Add Firebase environment variables in Vercel to sign in and publish games (see{" "}
          <code>.env.example</code>).
        </p>
        <button
          type="button"
          onClick={() => setTab("browse")}
          className="mt-4 text-sm font-medium text-laf-gold hover:underline"
        >
          ← Back to browse games
        </button>
      </div>
    );
  }

  const myGames = user ? games.filter((g) => g.authorId === user.uid) : [];

  function flash(type: "success" | "error", text: string) {
    setGlobalMsg({ type, text });
    setTimeout(() => setGlobalMsg(null), 4000);
  }

  function resetForm() {
    setEditId("");
    setFormTitle("");
    setFormDesc("");
    setFormUrl("");
    setFormError("");
  }

  function startEdit(game: ScratchGame) {
    setTab("my-games");
    setEditId(game.id);
    setFormTitle(game.title);
    setFormDesc(game.description ?? "");
    setFormUrl(game.projectId);
    setFormError("");
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || !db) return;
    setAuthError("");
    try {
      if (authMode === "signup") {
        if (!authName.trim()) {
          setAuthError("Please enter a display name.");
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        await updateProfile(cred.user, { displayName: authName.trim() });
        await setDoc(doc(db, SCRATCH_USERS_COLLECTION, cred.user.uid), {
          displayName: authName.trim(),
          email: authEmail.trim(),
          createdAt: serverTimestamp(),
        });
        flash("success", "Account created! You can now publish games.");
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        flash("success", "Signed in successfully.");
      }
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Try signing in.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setAuthError(messages[code ?? ""] ?? "Authentication failed.");
    }
  }

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setFormError("");
    if (!user) {
      setFormError("Please sign in to publish games.");
      return;
    }
    const projectId = parseScratchProjectId(formUrl);
    if (!formTitle.trim() || !projectId) {
      setFormError("Enter a title and valid Scratch project URL or numeric ID.");
      return;
    }
    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      projectId,
      authorId: user.uid,
      authorName: user.displayName || user.email || "Anonymous",
      updatedAt: serverTimestamp(),
    };
    try {
      setSaving(true);
      if (editId) {
        await updateDoc(doc(db, SCRATCH_GAMES_COLLECTION, editId), payload);
        flash("success", "Game updated!");
      } else {
        await addDoc(collection(db, SCRATCH_GAMES_COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        flash("success", "Game published!");
      }
      resetForm();
      await loadGames();
    } catch {
      setFormError("Could not save game. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(game: ScratchGame) {
    if (!db || !user || game.authorId !== user.uid) return;
    if (!confirm(`Delete "${game.title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, SCRATCH_GAMES_COLLECTION, game.id));
      flash("success", "Game deleted.");
      await loadGames();
    } catch {
      flash("error", "Could not delete game.");
    }
  }

  async function copyEmbed(game: ScratchGame) {
    await navigator.clipboard.writeText(scratchEmbedCode(game.projectId));
    setCopiedId(game.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const tabs: { id: Tab; label: string; hidden?: boolean }[] = [
    { id: "browse", label: "Browse games" },
    { id: "my-games", label: "My games", hidden: !user },
    { id: "account", label: user ? "Account" : "Sign in", hidden: !!user },
  ];

  return (
    <div className="space-y-8">
      {globalMsg && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            globalMsg.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {globalMsg.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs
            .filter((t) => !t.hidden)
            .map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? "bg-laf-navy text-white"
                    : "bg-white border border-laf-border text-laf-muted hover:text-laf-navy"
                }`}
              >
                {t.label}
              </button>
            ))}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-laf-muted">
                Signed in as <strong className="text-laf-navy">{user.displayName || user.email}</strong>
              </span>
              <button
                type="button"
                onClick={() => auth && signOut(auth)}
                className="text-sm font-medium text-laf-gold hover:underline"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setTab("account");
              }}
              className="px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright"
            >
              Sign in to publish
            </button>
          )}
        </div>
      </div>

      {tab === "browse" && (
        <section>
          <p className="mb-6 text-sm text-laf-muted">
            No account needed — pick a game below and play in your browser. Sign in only if you want to publish your own
            Scratch project.
          </p>
          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-800">{loadError}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadGames();
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-laf-navy text-white text-sm font-medium hover:bg-laf-navy/90"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <p className="text-center text-laf-muted py-12">Loading games…</p>
          ) : games.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-laf-border bg-laf-cream/40 p-12 text-center">
              <p className="text-laf-muted">No games yet. Be the first to share a Scratch project!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {games.map((game) => (
                <article
                  key={game.id}
                  className="rounded-2xl border border-laf-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[485/402] bg-laf-cream relative">
                    <iframe
                      src={scratchEmbedUrl(game.projectId)}
                      className="absolute inset-0 w-full h-full"
                      allowTransparency
                      allowFullScreen
                      title={game.title}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-laf-navy">{game.title}</h3>
                    <p className="mt-1 text-xs text-laf-muted">
                      By {game.authorName} · {formatGameDate(game.createdAt)}
                    </p>
                    {game.description && (
                      <p className="mt-2 text-sm text-laf-muted line-clamp-2">{game.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPlayGame(game)}
                        className="px-3 py-1.5 rounded-lg bg-laf-gold text-white text-xs font-semibold hover:bg-laf-gold-bright"
                      >
                        Play full screen
                      </button>
                      <a
                        href={scratchProjectUrl(game.projectId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-laf-border text-xs font-medium text-laf-navy hover:border-laf-gold"
                      >
                        Open on Scratch
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "my-games" && user && (
        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-xl font-bold text-laf-navy mb-4">Your published games</h2>
            {myGames.length === 0 ? (
              <p className="text-sm text-laf-muted">You haven&apos;t published any games yet.</p>
            ) : (
              <ul className="space-y-3">
                {myGames.map((game) => (
                  <li
                    key={game.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-laf-border bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-laf-navy">{game.title}</p>
                      <p className="text-xs text-laf-muted">Project {game.projectId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyEmbed(game)}
                        className="text-xs font-medium text-laf-gold hover:underline"
                      >
                        {copiedId === game.id ? "Copied!" : "Copy embed"}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(game)}
                        className="text-xs font-medium text-laf-navy hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(game)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-laf-border bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-laf-navy">
              {editId ? "Edit game" : "Add a Scratch game"}
            </h2>
            <p className="mt-2 text-sm text-laf-muted">
              Paste your Scratch project link (e.g.{" "}
              <code className="text-xs bg-laf-cream px-1 rounded">
                scratch.mit.edu/projects/123456789
              </code>
              ) or the project ID. Your game will appear in the public gallery.
            </p>
            <form onSubmit={handleSaveGame} className="mt-6 space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-laf-navy mb-1">Game title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  maxLength={120}
                  required
                  className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-laf-gold/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-laf-navy mb-1">
                  Scratch project URL or ID
                </label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://scratch.mit.edu/projects/1330407467"
                  required
                  className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-laf-gold/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-laf-navy mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-laf-gold/40"
                />
              </div>
              {formUrl && parseScratchProjectId(formUrl) && (
                <div className="rounded-lg bg-laf-cream/60 p-3">
                  <p className="text-xs font-medium text-laf-navy mb-2">Embed preview</p>
                  <code className="block text-[10px] text-laf-muted break-all leading-relaxed">
                    {scratchEmbedCode(parseScratchProjectId(formUrl)!)}
                  </code>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright disabled:opacity-60"
                >
                  {saving ? "Saving…" : editId ? "Save changes" : "Publish game"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-lg border border-laf-border text-sm font-medium text-laf-muted"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      )}

      {tab === "account" && !user && (
        <section className="max-w-md mx-auto rounded-2xl border border-laf-border bg-white p-8">
          <h2 className="text-xl font-bold text-laf-navy">
            {authMode === "signup" ? "Create account" : "Sign in"}
          </h2>
          <p className="mt-2 text-sm text-laf-muted">
            Create a free account to publish your Scratch games to the community gallery.
          </p>
          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {authError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}
            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-laf-navy mb-1">Display name</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-laf-navy mb-1">Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-laf-navy mb-1">Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright"
            >
              {authMode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-laf-muted">
            {authMode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError("");
              }}
              className="text-laf-gold font-medium hover:underline"
            >
              {authMode === "signup" ? "Sign in" : "Create account"}
            </button>
          </p>
        </section>
      )}

      {playGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPlayGame(null)}
          role="dialog"
          aria-modal
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-laf-border">
              <div>
                <h3 className="font-semibold text-laf-navy">{playGame.title}</h3>
                <p className="text-xs text-laf-muted">By {playGame.authorName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPlayGame(null)}
                className="text-laf-muted hover:text-laf-navy text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="aspect-[4/3] bg-laf-cream">
              <iframe
                src={scratchEmbedUrl(playGame.projectId)}
                className="w-full h-full"
                allowTransparency
                allowFullScreen
                title={playGame.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
