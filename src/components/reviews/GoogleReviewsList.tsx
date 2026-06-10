"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  getFirebaseDb,
  GOOGLE_REVIEWS_COLLECTION,
  GOOGLE_REVIEWS_META_COLLECTION,
} from "@/lib/firebase";
import type { GoogleReviewRecord, GoogleReviewsMeta } from "@/lib/google-reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-laf-gold" : "text-laf-border"}>
          ★
        </span>
      ))}
    </div>
  );
}

type GoogleReviewsListProps = {
  fallbackMessage?: string;
};

export default function GoogleReviewsList({ fallbackMessage }: GoogleReviewsListProps) {
  const db = getFirebaseDb();
  const [reviews, setReviews] = useState<GoogleReviewRecord[]>([]);
  const [meta, setMeta] = useState<GoogleReviewsMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubMeta = onSnapshot(doc(db, GOOGLE_REVIEWS_META_COLLECTION, "summary"), (snap) => {
      if (snap.exists()) {
        setMeta(snap.data() as GoogleReviewsMeta);
      }
    });

    const q = query(collection(db, GOOGLE_REVIEWS_COLLECTION), orderBy("sortAt", "desc"));
    const unsubReviews = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as GoogleReviewRecord);
        setReviews(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => {
      unsubMeta();
      unsubReviews();
    };
  }, [db]);

  if (loading) {
    return <p className="text-sm text-laf-muted">Loading reviews…</p>;
  }

  return (
    <div className="space-y-8">
      {meta && (meta.rating || meta.totalReviewCount) && (
        <div className="rounded-2xl border border-laf-border bg-white p-6 flex flex-wrap items-center gap-6">
          {meta.rating && (
            <div>
              <p className="text-4xl font-bold text-laf-navy tabular-nums">{meta.rating.toFixed(1)}</p>
              <Stars rating={Math.round(meta.rating)} />
            </div>
          )}
          <div className="text-sm text-laf-muted">
            {meta.totalReviewCount && (
              <p>
                <strong className="text-laf-navy">{meta.totalReviewCount}</strong> reviews on Google
              </p>
            )}
            {meta.lastSyncedAt && (
              <p className="mt-1">
                Updated {new Date(meta.lastSyncedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-laf-border bg-laf-cream/50 p-8 text-center">
          <p className="text-laf-navy font-semibold">Reviews syncing soon</p>
          <p className="mt-2 text-sm text-laf-muted max-w-lg mx-auto">
            {fallbackMessage ??
              "Our Google reviews are imported automatically each day. Leave yours using the QR code on this page."}
          </p>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-laf-border bg-white p-5 lg:p-6 space-y-3"
            >
              <div className="flex items-start gap-3">
                {review.authorPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.authorPhotoUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-laf-cream flex items-center justify-center text-sm font-semibold text-laf-navy shrink-0">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-laf-navy truncate">{review.authorName}</p>
                  <Stars rating={review.rating} />
                </div>
              </div>
              {review.text && (
                <p className="text-sm text-laf-muted leading-relaxed line-clamp-6">{review.text}</p>
              )}
              {(review.relativeTime || review.publishedAt) && (
                <p className="text-xs text-laf-muted">
                  {review.relativeTime ??
                    new Date(review.publishedAt!).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
