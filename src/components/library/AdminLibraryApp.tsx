"use client";

import { useEffect, useState } from "react";
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
  serverTimestamp,
  setDoc,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseConfig,
  getFirebaseDb,
  LIBRARY_RESOURCES_COLLECTION,
  LIBRARY_SUBMISSIONS_COLLECTION,
} from "@/lib/firebase";
import { seedLibraryResources } from "@/lib/library-seed";
import {
  isLibraryAdmin,
  normalizeLibraryResource,
  type LibrarySubmission,
} from "@/lib/library";
import { normalizeLibraryUrl, slugFromUrl } from "@/lib/library-url";

function toSubmission(snap: QueryDocumentSnapshot): LibrarySubmission | null {
  const data = snap.data() as Record<string, unknown>;
  const base = normalizeLibraryResource(data, snap.id);
  if (!base) return null;
  return {
    ...base,
    status: (data.status as LibrarySubmission["status"]) ?? "pending",
    rejectReason: typeof data.rejectReason === "string" ? data.rejectReason : undefined,
    submitterEmail: typeof data.submitterEmail === "string" ? data.submitterEmail : undefined,
    createdAt: data.createdAt as LibrarySubmission["createdAt"],
  };
}

export default function AdminLibraryApp() {
  const config = getFirebaseConfig();
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();

  const [user, setUser] = useState<User | null>(null);
  const [pending, setPending] = useState<LibrarySubmission[]>([]);
  const [resourceCount, setResourceCount] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const [seeding, setSeeding] = useState(false);

  const isAdmin = isLibraryAdmin(user?.email);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  useEffect(() => {
    if (!db || !isAdmin) return;

    const unsubPending = onSnapshot(
      collection(db, LIBRARY_SUBMISSIONS_COLLECTION),
      (snap) => {
        const list = snap.docs
          .map(toSubmission)
          .filter((s): s is LibrarySubmission => s !== null && s.status === "pending");
        list.sort((a, b) => {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return tb - ta;
        });
        setPending(list);
      }
    );

    const unsubResources = onSnapshot(collection(db, LIBRARY_RESOURCES_COLLECTION), (snap) => {
      setResourceCount(snap.size);
    });

    return () => {
      unsubPending();
      unsubResources();
    };
  }, [db, isAdmin]);

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

  async function handleSeed() {
    if (!db || !isAdmin) return;
    setSeeding(true);
    setMsg("");
    try {
      const count = await seedLibraryResources(db);
      setMsg(`Imported ${count} resources into Firestore.`);
    } catch {
      setMsg("Seed failed. Check Firestore rules and try again.");
    } finally {
      setSeeding(false);
    }
  }

  async function approveSubmission(sub: LibrarySubmission) {
    if (!db || !user || !isAdmin) return;
    setBusy(sub.id!);
    setMsg("");

    const slug = slugFromUrl(sub.url);
    const urlNormalized = sub.urlNormalized ?? normalizeLibraryUrl(sub.url) ?? sub.url;

    try {
      await setDoc(doc(db, LIBRARY_RESOURCES_COLLECTION, slug), {
        slug,
        url: sub.url,
        urlNormalized,
        title: sub.title,
        description: sub.description,
        ogImage: sub.ogImage ?? "",
        favicon: sub.favicon ?? "",
        categories: sub.categories,
        ageGroups: sub.ageGroups,
        difficulty: sub.difficulty,
        cost: sub.cost,
        languages: sub.languages,
        module: sub.module,
        safetyScore: sub.safetyScore ?? 80,
        educationalScore: sub.educationalScore ?? 70,
        featured: false,
        status: "approved",
        visitCount: 0,
        reportCount: 0,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, LIBRARY_SUBMISSIONS_COLLECTION, sub.id!), {
        status: "approved",
        reviewedAt: serverTimestamp(),
        reviewedBy: user.email,
      });

      setMsg(`Approved: ${sub.title}`);
    } catch {
      setMsg(`Failed to approve ${sub.title}.`);
    } finally {
      setBusy("");
    }
  }

  async function rejectSubmission(sub: LibrarySubmission, reason: string) {
    if (!db || !user || !isAdmin) return;
    setBusy(sub.id!);
    try {
      await updateDoc(doc(db, LIBRARY_SUBMISSIONS_COLLECTION, sub.id!), {
        status: "rejected",
        rejectReason: reason,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.email,
      });
      setMsg(`Rejected: ${sub.title}`);
    } catch {
      setMsg(`Failed to reject ${sub.title}.`);
    } finally {
      setBusy("");
    }
  }

  if (!config || !auth || !db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-semibold text-laf-navy">Firebase not configured</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <form
        onSubmit={handleLogin}
        className="max-w-md mx-auto rounded-2xl border border-laf-border bg-white p-8 space-y-4"
      >
        <h2 className="text-xl font-bold text-laf-navy">Admin sign in</h2>
        <p className="text-sm text-laf-muted">Sign in with admin@agrawalfoundation.org</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-laf-border"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-laf-border"
        />
        {authError && <p className="text-sm text-red-600">{authError}</p>}
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-laf-navy text-white font-semibold text-sm"
        >
          Sign in
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-laf-muted">
            Signed in as <strong className="text-laf-navy">{user.email}</strong>
          </p>
          <p className="text-sm text-laf-muted mt-1">
            {resourceCount} resources in Firestore · {pending.length} pending
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-laf-cream disabled:opacity-60"
          >
            {seeding ? "Importing…" : "Import 58 seed resources"}
          </button>
          <button
            type="button"
            onClick={() => signOut(auth)}
            className="px-4 py-2 rounded-lg text-sm text-laf-muted hover:text-laf-navy"
          >
            Sign out
          </button>
        </div>
      </div>

      {msg && (
        <p className="text-sm text-laf-navy bg-laf-cream border border-laf-border rounded-lg px-4 py-3">
          {msg}
        </p>
      )}

      <section>
        <h2 className="text-xl font-bold text-laf-navy mb-4">Pending submissions</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-laf-muted rounded-2xl border border-laf-border bg-white p-8 text-center">
            No pending submissions.
          </p>
        ) : (
          <ul className="space-y-4">
            {pending.map((sub) => (
              <li
                key={sub.id}
                className="rounded-2xl border border-laf-border bg-white p-5 lg:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-laf-navy">{sub.title}</h3>
                    <a
                      href={sub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-laf-gold hover:underline break-all"
                    >
                      {sub.url}
                    </a>
                    <p className="mt-2 text-sm text-laf-muted line-clamp-3">{sub.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-laf-muted">
                      <span>Safety: {sub.safetyScore ?? "—"}</span>
                      <span>Educational: {sub.educationalScore ?? "—"}</span>
                      <span>{sub.categories?.join(", ")}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy === sub.id}
                      onClick={() => approveSubmission(sub)}
                      className="px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy === sub.id}
                      onClick={() => rejectSubmission(sub, "Does not meet library guidelines")}
                      className="px-4 py-2 rounded-lg border border-laf-border text-sm text-laf-muted hover:text-red-600 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
