"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  faviconUrl,
  moduleLabel,
  type LibraryResource,
} from "@/lib/library";
import {
  getFirebaseDb,
  LIBRARY_REPORTS_COLLECTION,
  LIBRARY_RESOURCES_COLLECTION,
} from "@/lib/firebase";
import { normalizeLibraryResource } from "@/lib/library";

type ResourceDetailViewProps = {
  slug: string;
  seedResource: LibraryResource | null;
};

export default function ResourceDetailView({ slug, seedResource }: ResourceDetailViewProps) {
  const db = getFirebaseDb();
  const [resource, setResource] = useState<LibraryResource | null>(seedResource);
  const [loading, setLoading] = useState(Boolean(db) && !seedResource);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("broken");
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const ref = doc(db, LIBRARY_RESOURCES_COLLECTION, slug);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const parsed = normalizeLibraryResource(snap.data() as Record<string, unknown>, snap.id);
        if (parsed) setResource(parsed);
      } else if (!seedResource) {
        setResource(null);
      }
      setLoading(false);
    });
  }, [db, slug, seedResource]);

  if (loading) {
    return <div className="h-64 rounded-2xl border border-laf-border bg-white animate-pulse" />;
  }

  if (!resource) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-12 text-center">
        <p className="text-lg font-semibold text-laf-navy">Resource not found</p>
        <Link href="/library" className="mt-4 inline-block text-sm text-laf-gold hover:underline">
          ← Back to library
        </Link>
      </div>
    );
  }

  async function handleVisit() {
    if (!db || !resource) return;
    try {
      await updateDoc(doc(db, LIBRARY_RESOURCES_COLLECTION, resource.slug), {
        visitCount: increment(1),
      });
    } catch {
      // Non-blocking
    }
  }

  async function handleShare() {
    if (!resource) return;
    const url = `${window.location.origin}/library/${resource.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!db || !resource) return;
    try {
      await addDoc(collection(db, LIBRARY_REPORTS_COLLECTION), {
        resourceId: resource.slug,
        resourceTitle: resource.title,
        resourceUrl: resource.url,
        reason: reportReason,
        createdAt: serverTimestamp(),
        status: "open",
      });
      await updateDoc(doc(db, LIBRARY_RESOURCES_COLLECTION, resource.slug), {
        reportCount: increment(1),
      });
      setReportMsg("Thank you — we will review this report.");
    } catch {
      setReportMsg("Could not submit. Email admin@agrawalfoundation.org.");
    }
  }

  const isScholarship = resource.module === "scholarships";

  return (
    <article className="max-w-3xl">
      <Link href="/library" className="text-sm text-laf-gold hover:underline">
        ← Back to library
      </Link>

      <div className="mt-6 rounded-2xl border border-laf-border bg-white overflow-hidden">
        <div className="flex items-start gap-5 p-6 lg:p-8 border-b border-laf-border bg-laf-cream/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.favicon || faviconUrl(resource.url)}
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 rounded-xl bg-white border border-laf-border shrink-0"
          />
          <div>
            <p className="text-xs font-medium text-laf-gold uppercase tracking-wide">
              {moduleLabel(resource.module)}
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-bold text-laf-navy">{resource.title}</h1>
            <p className="mt-2 text-sm text-laf-muted break-all">{resource.url}</p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          <p className="text-laf-muted leading-relaxed">{resource.description}</p>

          {isScholarship && (resource.eligibility || resource.deadline) && (
            <div className="rounded-xl border border-laf-gold/30 bg-laf-cream/60 p-5 space-y-3">
              <h2 className="font-semibold text-laf-navy">Scholarship details</h2>
              {resource.eligibility && (
                <p className="text-sm text-laf-muted">
                  <strong className="text-laf-navy">Eligibility:</strong> {resource.eligibility}
                </p>
              )}
              {resource.deadline && (
                <p className="text-sm text-laf-muted">
                  <strong className="text-laf-navy">Deadline:</strong> {resource.deadline}
                </p>
              )}
              {(resource.ageMin || resource.ageMax) && (
                <p className="text-sm text-laf-muted">
                  <strong className="text-laf-navy">Age range:</strong>{" "}
                  {resource.ageMin ?? "?"}–{resource.ageMax ?? "?"} years
                </p>
              )}
              <p className="text-xs text-laf-muted/80">
                Verify deadlines on the official website before applying.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {resource.categories.map((cat) => (
              <span
                key={cat}
                className="text-xs px-2.5 py-1 rounded-full bg-laf-navy/8 text-laf-navy font-medium"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-laf-muted">
            <span className="px-3 py-1 rounded-lg bg-laf-cream border border-laf-border">
              Ages {resource.ageGroups.join(", ")}
            </span>
            <span className="px-3 py-1 rounded-lg bg-laf-cream border border-laf-border">
              {resource.difficulty}
            </span>
            <span className="px-3 py-1 rounded-lg bg-laf-cream border border-laf-border">
              {resource.cost}
            </span>
            <span className="px-3 py-1 rounded-lg bg-laf-cream border border-laf-border">
              {resource.languages.join(", ")}
            </span>
          </div>

          {resource.linkStatus === "broken" && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              This link was flagged as possibly broken. If it does not work, please report it.
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisit}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
            >
              Visit Website
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-3 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-laf-cream"
            >
              {copied ? "Link copied!" : "Share"}
            </button>
            <button
              type="button"
              onClick={() => setReportOpen(!reportOpen)}
              className="px-4 py-3 rounded-lg border border-laf-border text-sm text-laf-muted hover:text-laf-navy"
            >
              Report
            </button>
          </div>

          {reportOpen && (
            <form onSubmit={handleReport} className="border-t border-laf-border pt-4 space-y-2">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border border-laf-border"
                aria-label="Report reason"
              >
                <option value="broken">Broken link</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="misleading">Misleading</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className="text-sm font-medium text-laf-gold hover:underline">
                Submit report
              </button>
              {reportMsg && <p className="text-sm text-laf-muted">{reportMsg}</p>}
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
