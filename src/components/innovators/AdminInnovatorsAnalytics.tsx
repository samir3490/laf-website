"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where, type QueryDocumentSnapshot } from "firebase/firestore";
import { eventSocialLink } from "@/lib/event-attribution";
import {
  aggregateEventAnalytics,
  EVENT_TRAFFIC_SOURCES,
  LAF_EVENT_ANALYTICS_COLLECTION,
  normalizeEventAnalyticsEvent,
  type EventAnalyticsEvent,
} from "@/lib/event-analytics";
import {
  type LafEventAdminEntry,
  YOUNG_INNOVATORS_2026_EVENT_SLUG,
} from "@/lib/event-submissions";
import { getFirebaseDb } from "@/lib/firebase";

function toEvent(snap: QueryDocumentSnapshot): EventAnalyticsEvent | null {
  return normalizeEventAnalyticsEvent(snap.data() as Record<string, unknown>, snap.id);
}

const FAIL_REASON_LABEL: Record<string, string> = {
  invalid_phone: "Invalid / India-only mobile (fixed for other countries)",
  email_unverified: "Email code expired or not verified",
  invalid_email: "Invalid email",
  invalid_description: "Description too short",
  invalid_video: "Video link not YouTube/Drive",
  invalid_photo: "Photo missing or invalid",
  upload_failed: "Photo upload failed",
  rate_limited: "Too many submits from same network/email",
  captcha: "Captcha failed",
  did_not_save: "Form did not save",
  unknown: "No reason recorded (older attempts)",
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

type Props = { entries: LafEventAdminEntry[] };

export default function AdminInnovatorsAnalytics({ entries }: Props) {
  const db = getFirebaseDb();
  const [events, setEvents] = useState<EventAnalyticsEvent[]>([]);
  const slug = YOUNG_INNOVATORS_2026_EVENT_SLUG;

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, LAF_EVENT_ANALYTICS_COLLECTION), where("eventSlug", "==", slug));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(toEvent).filter((e): e is EventAnalyticsEvent => e !== null);
      list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      setEvents(list);
    });
  }, [db, slug]);

  const submissionSources = useMemo(
    () =>
      entries
        .map((e) => e.trafficSource)
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [entries]
  );

  const stats = useMemo(
    () => aggregateEventAnalytics(events, submissionSources),
    [events, submissionSources]
  );

  const totalSubmissions = entries.filter((e) => e.status !== "removed").length;
  const approved = entries.filter((e) => e.status === "approved").length;
  const pending = entries.filter((e) => e.status === "pending").length;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-laf-navy">Traffic &amp; submissions</h2>
        <p className="mt-1 text-sm text-laf-muted">
          See how visitors arrive from Instagram, Facebook, and other sources — and how many complete
          a project submission.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Event page visits" value={stats.pageViews.home} />
        <StatCard label="Gallery page visits" value={stats.pageViews.gallery} />
        <StatCard label="Submit page visits" value={stats.pageViews.submit} />
        <StatCard
          label="Successful submissions"
          value={stats.funnel.submitSuccess}
          hint={`${totalSubmissions} total (${approved} approved, ${pending} pending)`}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard
          label="Submit conversion"
          value={`${stats.conversionRate}%`}
          hint="Successful submissions ÷ submit page visits"
        />
        <StatCard label="Email codes verified" value={stats.funnel.otpVerified} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-laf-border bg-white p-5">
          <h3 className="font-semibold text-laf-navy">Visits by source</h3>
          <ul className="mt-3 space-y-2 text-sm text-laf-muted">
            {EVENT_TRAFFIC_SOURCES.map((source) => (
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
            {EVENT_TRAFFIC_SOURCES.map((source) => (
              <li key={source} className="flex justify-between gap-2 capitalize">
                <span>{source}</span>
                <span className="tabular-nums font-medium text-laf-navy">
                  {stats.submissionsBySource[source]}
                </span>
              </li>
            ))}
          </ul>
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
            <p className="text-xs text-laf-muted mt-1">Submitted project</p>
          </div>
        </div>
        {stats.funnel.submitFailed > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-red-600">
              {stats.funnel.submitFailed} failed attempt
              {stats.funnel.submitFailed === 1 ? "" : "s"} — these are people who hit Submit but
              were blocked (not lost approved entries). The same person retrying counts more than
              once.
            </p>
            {Object.keys(stats.funnel.failedByReason).length > 0 && (
              <ul className="text-xs text-laf-muted">
                {Object.entries(stats.funnel.failedByReason)
                  .sort((a, b) => b[1] - a[1])
                  .map(([reason, count]) => (
                    <li key={reason}>
                      {FAIL_REASON_LABEL[reason] ?? reason}: {count}
                    </li>
                  ))}
              </ul>
            )}
          </div>
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
          {(
            [
              ["Instagram → event", "instagram", "home"],
              ["Facebook → event", "facebook", "home"],
              ["Instagram → gallery", "instagram", "gallery"],
              ["Facebook → gallery", "facebook", "gallery"],
              ["Instagram → submit", "instagram", "submit"],
              ["Facebook → submit", "facebook", "submit"],
            ] as const
          ).map(([label, platform, page]) => {
            const href = eventSocialLink(slug, page, platform, "young-innovators-2026");
            return (
              <p key={label}>
                <span className="font-medium text-laf-navy">{label}: </span>
                <a href={href} className="text-laf-gold hover:underline">
                  {href}
                </a>
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}
