"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  faviconUrl,
  type LibraryResource,
} from "@/lib/library";
import {
  getFirebaseDb,
  LIBRARY_REPORTS_COLLECTION,
  LIBRARY_RESOURCES_COLLECTION,
} from "@/lib/firebase";

type ResourceCardProps = {
  resource: LibraryResource;
  trackClicks?: boolean;
};

export default function ResourceCard({ resource, trackClicks = true }: ResourceCardProps) {
  const db = getFirebaseDb();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("broken");
  const [reportMsg, setReportMsg] = useState("");

  async function handleVisit() {
    if (!trackClicks || !db || !resource.slug) return;
    try {
      await updateDoc(doc(db, LIBRARY_RESOURCES_COLLECTION, resource.slug), {
        visitCount: increment(1),
      });
    } catch {
      // Non-blocking
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!db || !resource.slug) return;
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
      setTimeout(() => {
        setReportOpen(false);
        setReportMsg("");
      }, 2000);
    } catch {
      setReportMsg("Could not submit report. Please email admin@agrawalfoundation.org.");
    }
  }

  return (
    <article className="rounded-2xl border border-laf-border bg-white overflow-hidden flex flex-col hover:shadow-md hover:border-laf-gold/40 transition-all h-full">
      <div className="flex items-start gap-4 p-5 border-b border-laf-border/60 bg-laf-cream/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resource.favicon || faviconUrl(resource.url)}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg bg-white border border-laf-border shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-laf-navy leading-snug line-clamp-2">
            {resource.title}
          </h3>
          <p className="mt-1 text-xs text-laf-muted truncate">{resource.url}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-sm text-laf-muted leading-relaxed line-clamp-3 flex-1">
          {resource.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {resource.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-[11px] px-2 py-0.5 rounded-full bg-laf-navy/8 text-laf-navy font-medium"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-laf-muted">
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            Ages {resource.ageGroups.join(", ")}
          </span>
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            {resource.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            {resource.cost}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleVisit}
            className="inline-flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors min-w-[140px]"
          >
            Visit Website
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <button
            type="button"
            onClick={() => setReportOpen(!reportOpen)}
            className="px-3 py-2.5 rounded-lg border border-laf-border text-xs text-laf-muted hover:text-laf-navy transition-colors"
          >
            Report
          </button>
        </div>

        {reportOpen && (
          <form onSubmit={handleReport} className="mt-3 pt-3 border-t border-laf-border space-y-2">
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border border-laf-border"
              aria-label="Report reason"
            >
              <option value="broken">Broken link</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="misleading">Misleading</option>
              <option value="other">Other</option>
            </select>
            <button
              type="submit"
              className="text-xs font-medium text-laf-gold hover:underline"
            >
              Submit report
            </button>
            {reportMsg && <p className="text-xs text-laf-muted">{reportMsg}</p>}
          </form>
        )}
      </div>
    </article>
  );
}
