"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, type QueryDocumentSnapshot } from "firebase/firestore";
import {
  aggregateDrawingAnalytics,
  DRAWING_ANALYTICS_EVENTS_COLLECTION,
  DRAWING_TRAFFIC_SOURCES,
  normalizeDrawingAnalyticsEvent,
  type DrawingAnalyticsEvent,
} from "@/lib/drawing-analytics";
import { drawingSocialLink } from "@/lib/drawing-attribution";
import type { DrawingEntryAdmin } from "@/lib/drawing";
import { getFirebaseDb } from "@/lib/firebase";

function toEvent(snap: QueryDocumentSnapshot): DrawingAnalyticsEvent | null {
  return normalizeDrawingAnalyticsEvent(snap.data() as Record<string, unknown>, snap.id);
}

type AdminDrawingAnalyticsProps = {
  entries: DrawingEntryAdmin[];
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-laf-border bg-white p-5">
      <p className="text-sm text-laf-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-laf-gold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-laf-muted">{hint}</p>}
    </div>
  );
}

export default function AdminDrawingAnalytics({ entries }: AdminDrawingAnalyticsProps) {
  const db = getFirebaseDb();
  const [events, setEvents] = useState<DrawingAnalyticsEvent[]>([]);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(collection(db, DRAWING_ANALYTICS_EVENTS_COLLECTION), (snap) => {
      const list = snap.docs.map(toEvent).filter((e): e is DrawingAnalyticsEvent => e !== null);
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      setEvents(list);
    });
  }, [db]);

  const submissionSources = useMemo(
    () =>
      entries
        .map((e) => e.trafficSource)
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [entries]
  );

  const stats = useMemo(
    () => aggregateDrawingAnalytics(events, submissionSources),
    [events, submissionSources]
  );

  const totalSubmissions = entries.filter((e) => e.status !== "removed").length;
  const liveSubmissions = entries.filter((e) => e.status === "active").length;
  const pendingSubmissions = entries.filter((e) => e.status === "pending").length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-laf-navy">Traffic &amp; submissions</h2>
        <p className="mt-1 text-sm text-laf-muted">
          See how visitors arrive from Instagram, Facebook, and other sources — and how many complete a
          drawing submission.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gallery page visits" value={stats.pageViews.gallery} />
        <StatCard label="Submit page visits" value={stats.pageViews.submit} />
        <StatCard
          label="Successful submissions"
          value={stats.funnel.submitSuccess}
          hint={`${totalSubmissions} total entries (${liveSubmissions} live, ${pendingSubmissions} pending)`}
        />
        <StatCard
          label="Submit conversion"
          value={`${stats.conversionRate}%`}
          hint="Successful submissions ÷ submit page visits"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h3 className="font-semibold text-laf-navy">Visits by source</h3>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {DRAWING_TRAFFIC_SOURCES.map((source) => (
              <li key={source} className="flex justify-between gap-2 capitalize">
                <span>{source}</span>
                <span className="tabular-nums font-medium text-laf-navy">{stats.bySource[source]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h3 className="font-semibold text-laf-navy">Submissions by source</h3>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {DRAWING_TRAFFIC_SOURCES.map((source) => (
              <li key={source} className="flex justify-between gap-2 capitalize">
                <span>{source}</span>
                <span className="tabular-nums font-medium text-laf-navy">
                  {stats.submissionsBySource[source]}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-laf-muted">
            Submissions tracked from when attribution was added. Older entries may show as direct.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-laf-border bg-white p-5">
        <h3 className="font-semibold text-laf-navy">Submission funnel</h3>
        <div className="mt-4 grid sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-xl bg-laf-cream/50 p-4 text-center">
            <p className="text-2xl font-bold text-laf-navy tabular-nums">{stats.pageViews.submit}</p>
            <p className="text-xs text-laf-muted mt-1">Opened submit page</p>
          </div>
          <div className="rounded-xl bg-laf-cream/50 p-4 text-center">
            <p className="text-2xl font-bold text-laf-navy tabular-nums">{stats.funnel.otpSent}</p>
            <p className="text-xs text-laf-muted mt-1">Requested email code</p>
          </div>
          <div className="rounded-xl bg-laf-cream/50 p-4 text-center">
            <p className="text-2xl font-bold text-laf-navy tabular-nums">{stats.funnel.otpVerified}</p>
            <p className="text-xs text-laf-muted mt-1">Verified email</p>
          </div>
          <div className="rounded-xl bg-laf-cream/50 p-4 text-center">
            <p className="text-2xl font-bold text-laf-gold tabular-nums">{stats.funnel.submitSuccess}</p>
            <p className="text-xs text-laf-muted mt-1">Submitted artwork</p>
          </div>
        </div>
        {stats.funnel.submitFailed > 0 && (
          <p className="mt-3 text-xs text-red-600">
            {stats.funnel.submitFailed} failed submission attempt
            {stats.funnel.submitFailed === 1 ? "" : "s"} recorded.
          </p>
        )}
      </div>

      {stats.recentDays.length > 0 && (
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h3 className="font-semibold text-laf-navy">Last 14 days</h3>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {stats.recentDays.map((day) => (
              <li key={day.date} className="flex justify-between gap-4">
                <span>{day.date}</span>
                <span className="tabular-nums">
                  {day.visits} visit{day.visits === 1 ? "" : "s"} · {day.submissions} submission
                  {day.submissions === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-laf-border bg-laf-cream/40 p-5 space-y-3">
        <h3 className="font-semibold text-laf-navy">Trackable social links</h3>
        <p className="text-sm text-laf-muted">
          Use these links in Instagram and Facebook posts so visits are counted correctly:
        </p>
        <div className="space-y-2 text-xs break-all">
          <p>
            <span className="font-medium text-laf-navy">Instagram → gallery: </span>
            <a href={drawingSocialLink("gallery", "instagram")} className="text-laf-gold hover:underline">
              {drawingSocialLink("gallery", "instagram")}
            </a>
          </p>
          <p>
            <span className="font-medium text-laf-navy">Facebook → gallery: </span>
            <a href={drawingSocialLink("gallery", "facebook")} className="text-laf-gold hover:underline">
              {drawingSocialLink("gallery", "facebook")}
            </a>
          </p>
          <p>
            <span className="font-medium text-laf-navy">Instagram → submit: </span>
            <a href={drawingSocialLink("submit", "instagram")} className="text-laf-gold hover:underline">
              {drawingSocialLink("submit", "instagram")}
            </a>
          </p>
          <p>
            <span className="font-medium text-laf-navy">Facebook → submit: </span>
            <a href={drawingSocialLink("submit", "facebook")} className="text-laf-gold hover:underline">
              {drawingSocialLink("submit", "facebook")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
