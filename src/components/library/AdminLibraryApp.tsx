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
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  contributorDisplayLabel,
  contributorDocId,
} from "@/lib/library-contributors";
import {
  getFirebaseAuth,
  getFirebaseConfig,
  getFirebaseDb,
  LIBRARY_CONTRIBUTORS_COLLECTION,
  LIBRARY_REPORTS_COLLECTION,
  LIBRARY_RESOURCES_COLLECTION,
  LIBRARY_SEARCH_EVENTS_COLLECTION,
  LIBRARY_SUBMISSIONS_COLLECTION,
} from "@/lib/firebase";
import { seedLibraryResources } from "@/lib/library-seed";
import {
  isLibraryAdmin,
  normalizeLibraryResource,
  type LibraryResource,
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
    contributorDisplayName:
      typeof data.contributorDisplayName === "string" ? data.contributorDisplayName : undefined,
    notifyOnApproval: data.notifyOnApproval === true,
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
  const [topVisited, setTopVisited] = useState<LibraryResource[]>([]);
  const [topSearches, setTopSearches] = useState<{ query: string; count: number }[]>([]);
  const [openReports, setOpenReports] = useState(0);
  const [linkCheckResult, setLinkCheckResult] = useState<string>("");
  const [checkingLinks, setCheckingLinks] = useState(false);

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
      const list = snap.docs
        .map((d) => normalizeLibraryResource(d.data() as Record<string, unknown>, d.id))
        .filter((r): r is LibraryResource => r !== null);
      list.sort((a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0));
      setTopVisited(list.slice(0, 5));
    });

    const unsubSearch = onSnapshot(collection(db, LIBRARY_SEARCH_EVENTS_COLLECTION), (snap) => {
      const counts = new Map<string, number>();
      snap.docs.forEach((d) => {
        const q = (d.data().query as string)?.toLowerCase();
        if (q) counts.set(q, (counts.get(q) ?? 0) + 1);
      });
      const sorted = [...counts.entries()]
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      setTopSearches(sorted);
    });

    const unsubReports = onSnapshot(collection(db, LIBRARY_REPORTS_COLLECTION), (snap) => {
      setOpenReports(snap.docs.filter((d) => d.data().status === "open").length);
    });

    return () => {
      unsubPending();
      unsubResources();
      unsubSearch();
      unsubReports();
    };
  }, [db, isAdmin]);

  async function handleLinkCheck() {
    setCheckingLinks(true);
    setLinkCheckResult("");
    try {
      const res = await fetch("/api/library/check-links");
      const data = await res.json();
      if (!res.ok) {
        setLinkCheckResult(data.error ?? "Link check failed.");
        return;
      }
      setLinkCheckResult(
        data.broken === 0
          ? `All ${data.checked} seed links OK (checked ${new Date(data.checkedAt).toLocaleString("en-IN")}).`
          : `${data.broken} broken of ${data.checked}: ${data.brokenLinks.map((b: { slug: string }) => b.slug).join(", ")}`
      );
    } catch {
      setLinkCheckResult("Link check failed.");
    } finally {
      setCheckingLinks(false);
    }
  }

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
        eligibility: sub.eligibility ?? null,
        deadline: sub.deadline ?? null,
        ageMin: sub.ageMin ?? null,
        ageMax: sub.ageMax ?? null,
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

      const contributorId = contributorDocId(sub);
      await setDoc(
        doc(db, LIBRARY_CONTRIBUTORS_COLLECTION, contributorId),
        {
          displayName: contributorDisplayLabel(sub),
          contributionCount: increment(1),
          lastContributedAt: serverTimestamp(),
        },
        { merge: true }
      );

      let notifyNote = "";
      if (sub.notifyOnApproval && sub.submitterEmail) {
        try {
          const idToken = await user.getIdToken();
          const res = await fetch("/api/library/notify-approval", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              to: sub.submitterEmail,
              resourceTitle: sub.title,
              resourceSlug: slug,
            }),
          });
          notifyNote = res.ok
            ? ` Email sent to ${sub.submitterEmail}.`
            : ` Could not send email (check GMAIL_* on Vercel).`;
        } catch {
          notifyNote = " Email notification failed.";
        }
      }

      setMsg(`Approved: ${sub.title}.${notifyNote}`);
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
            onClick={handleLinkCheck}
            disabled={checkingLinks}
            className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-laf-cream disabled:opacity-60"
          >
            {checkingLinks ? "Checking…" : "Check seed links"}
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

      {linkCheckResult && (
        <p className="text-sm text-laf-muted bg-white border border-laf-border rounded-lg px-4 py-3">
          {linkCheckResult}
        </p>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h2 className="font-semibold text-laf-navy">Top visits</h2>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {topVisited.length === 0 ? (
              <li>No visit data yet</li>
            ) : (
              topVisited.map((r) => (
                <li key={r.slug} className="flex justify-between gap-2">
                  <span className="truncate">{r.title}</span>
                  <span className="shrink-0 tabular-nums">{r.visitCount ?? 0}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h2 className="font-semibold text-laf-navy">Top searches</h2>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {topSearches.length === 0 ? (
              <li>No searches logged yet</li>
            ) : (
              topSearches.map((s) => (
                <li key={s.query} className="flex justify-between gap-2">
                  <span className="truncate">{s.query}</span>
                  <span className="shrink-0 tabular-nums">{s.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h2 className="font-semibold text-laf-navy">Open reports</h2>
          <p className="mt-3 text-3xl font-bold text-laf-gold tabular-nums">{openReports}</p>
          <p className="text-xs text-laf-muted mt-1">User-flagged resources</p>
        </div>
      </section>

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
                      {sub.submitterEmail && (
                        <span>Email: {sub.submitterEmail}</span>
                      )}
                      {sub.notifyOnApproval && (
                        <span className="text-amber-700 font-medium">Wants email when reviewed</span>
                      )}
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
