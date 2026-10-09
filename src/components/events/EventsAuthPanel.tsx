"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { isEventsAdmin } from "@/lib/event-members";
import { getFirebaseAuth, getFirebaseConfig } from "@/lib/firebase";

type Mode = "login" | "signup";

export default function EventsAuthPanel() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [notifyNewEvents, setNotifyNewEvents] = useState(true);
  const [notifyBusy, setNotifyBusy] = useState(false);

  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const [announceLink, setAnnounceLink] = useState("https://agrawalfoundation.org/events");
  const [announceBusy, setAnnounceBusy] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState("");

  const isAdmin = isEventsAdmin(user?.email);

  const ensureProfile = useCallback(async (u: User) => {
    try {
      const token = await u.getIdToken();
      const res = await fetch("/api/events/members/ensure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: u.displayName }),
      });
      const data = (await res.json()) as {
        notifyNewEvents?: boolean;
        welcomeSent?: boolean;
        created?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      setNotifyNewEvents(data.notifyNewEvents !== false);
      if (data.created) {
        setInfo(
          data.welcomeSent
            ? "Welcome! Check your email — we’ll notify you about new events."
            : "You’re signed up for event updates."
        );
      }
    } catch {
      setError("Could not save your profile. Please refresh.");
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        setPanelOpen(false);
        void ensureProfile(u);
      }
    });
  }, [auth, ensureProfile]);

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "signup") {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setPassword("");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/invalid-credential": "Wrong email or password.",
        "auth/wrong-password": "Wrong email or password.",
        "auth/user-not-found": "No account with this email. Try signing up.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/popup-closed-by-user": "Sign-in was cancelled.",
      };
      setError(messages[code ?? ""] ?? "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleNotify(next: boolean) {
    if (!user) return;
    setNotifyBusy(true);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/events/members/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notifyNewEvents: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update preference.");
        return;
      }
      setNotifyNewEvents(next);
      setInfo(next ? "You’ll get emails about new events." : "New-event emails turned off.");
    } catch {
      setError("Could not update preference.");
    } finally {
      setNotifyBusy(false);
    }
  }

  async function sendAnnounce(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setAnnounceBusy(true);
    setAnnounceMsg("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/events/announce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: announceTitle.trim(),
          message: announceMessage.trim(),
          linkUrl: announceLink.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
        recipientCount?: number;
      };
      if (!res.ok) {
        setAnnounceMsg(data.error ?? "Send failed.");
        return;
      }
      setAnnounceMsg(
        `Sent to ${data.sent ?? 0} of ${data.recipientCount ?? 0} subscribers` +
          (data.failed ? ` (${data.failed} failed).` : ".")
      );
      setAnnounceTitle("");
      setAnnounceMessage("");
    } catch {
      setAnnounceMsg("Send failed.");
    } finally {
      setAnnounceBusy(false);
    }
  }

  if (!config) {
    return null;
  }

  if (!authReady) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-5 text-sm text-laf-muted">
        Loading sign-in…
      </div>
    );
  }

  if (user) {
    return (
      <div className="rounded-2xl border border-laf-gold/40 bg-laf-cream/50 p-5 lg:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">
              {isAdmin ? "Admin signed in" : "Signed in"}
            </p>
            <p className="mt-1 font-semibold text-laf-navy">
              {user.displayName || user.email}
            </p>
            {user.displayName && user.email ? (
              <p className="text-sm text-laf-muted">{user.email}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => auth && signOut(auth)}
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-white"
          >
            Log out
          </button>
        </div>

        <label className="flex items-start gap-3 text-sm text-laf-navy cursor-pointer">
          <input
            type="checkbox"
            className="mt-1"
            checked={notifyNewEvents}
            disabled={notifyBusy}
            onChange={(e) => void toggleNotify(e.target.checked)}
          />
          <span>
            <strong>Email me about new LAF events</strong>
            <span className="block text-laf-muted font-normal mt-0.5">
              Turned on when you signed up. You can change this anytime.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/events/young-innovators"
            className="px-4 py-2 rounded-lg bg-laf-navy text-white text-sm font-semibold"
          >
            Young Innovators
          </Link>
          <Link
            href="/events/drawing-competition"
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy"
          >
            Drawing Competition
          </Link>
        </div>

        {isAdmin && (
          <div className="rounded-xl border border-laf-navy/20 bg-white p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-laf-navy">Admin tools</p>
              <p className="text-xs text-laf-muted mt-1">
                Approve entries and email everyone who opted in for new events.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/innovators"
                className="px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright"
              >
                Approve Young Innovators
              </Link>
              <Link
                href="/admin/drawing"
                className="px-4 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold"
              >
                Approve Drawing
              </Link>
              <Link
                href="/admin/library"
                className="px-4 py-2.5 rounded-lg border border-laf-border text-sm font-medium text-laf-navy"
              >
                Library admin
              </Link>
            </div>

            <form onSubmit={(e) => void sendAnnounce(e)} className="space-y-3 border-t border-laf-border pt-4">
              <p className="text-sm font-semibold text-laf-navy">Announce a new event (email subscribers)</p>
              <input
                required
                value={announceTitle}
                onChange={(e) => setAnnounceTitle(e.target.value)}
                placeholder="Event title"
                className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
              />
              <textarea
                required
                rows={3}
                value={announceMessage}
                onChange={(e) => setAnnounceMessage(e.target.value)}
                placeholder="Short message for families"
                className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
              />
              <input
                required
                type="url"
                value={announceLink}
                onChange={(e) => setAnnounceLink(e.target.value)}
                placeholder="https://agrawalfoundation.org/events/…"
                className="w-full rounded-lg border border-laf-border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={announceBusy}
                className="px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
              >
                {announceBusy ? "Sending…" : "Email all subscribers"}
              </button>
              {announceMsg && <p className="text-sm text-laf-muted">{announceMsg}</p>}
            </form>
          </div>
        )}

        {(error || info) && (
          <p className={`text-sm ${error ? "text-red-700" : "text-laf-navy"}`}>{error || info}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-laf-border bg-white p-5 lg:p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-laf-navy">Sign up or log in</p>
        <p className="text-sm text-laf-muted mt-1 max-w-xl">
          Get emails when we announce new events. Admins can approve submissions after logging in.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <GoogleSignInButton
          auth={auth}
          label="Sign up / Log in with Google"
          disabled={busy}
          onBusy={setBusy}
          onError={(msg) => {
            setError(msg);
            setInfo("");
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-[#1e3a5f] bg-white text-[#1e3a5f] text-sm font-semibold hover:bg-laf-cream/60 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setPanelOpen((o) => !o)}
          className="px-5 py-2.5 rounded-lg bg-laf-navy text-white text-sm font-semibold hover:bg-laf-navy/90"
        >
          {panelOpen ? "Hide email form" : "Sign up / Log in with email"}
        </button>
      </div>

      {panelOpen && (
        <div className="space-y-4 border-t border-laf-border pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                mode === "signup" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                mode === "login" ? "bg-laf-navy text-white" : "bg-laf-cream text-laf-muted"
              }`}
            >
              Log in
            </button>
          </div>

          <form onSubmit={(e) => void handleEmailAuth(e)} className="space-y-3 max-w-md">
            {mode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
              />
            )}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
            <input
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Password (at least 6 characters)" : "Password"}
              className="w-full rounded-lg border border-laf-border px-3 py-2.5 text-sm"
            />
            {mode === "signup" && (
              <p className="text-xs text-laf-muted">
                By signing up, you’ll receive emails about new LAF events (you can turn this off
                later).
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Log in with email"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {info && !error && <p className="text-sm text-laf-navy">{info}</p>}
    </div>
  );
}
