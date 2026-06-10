"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { getFirebaseDb, LIBRARY_CONTRIBUTORS_COLLECTION } from "@/lib/firebase";

export type LibraryContributor = {
  id: string;
  displayName: string;
  contributionCount: number;
};

export default function LibraryContributorsList() {
  const db = getFirebaseDb();
  const [contributors, setContributors] = useState<LibraryContributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, LIBRARY_CONTRIBUTORS_COLLECTION),
      orderBy("contributionCount", "desc"),
      limit(25)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          displayName: String(data.displayName ?? "Community member"),
          contributionCount: Number(data.contributionCount ?? 0),
        };
      });
      setContributors(list);
      setLoading(false);
    });

    return unsub;
  }, [db]);

  if (loading) {
    return <p className="text-sm text-laf-muted">Loading contributors…</p>;
  }

  if (contributors.length === 0) {
    return (
      <div className="rounded-2xl border border-laf-border bg-white p-8 text-center">
        <p className="text-laf-navy font-semibold">No contributors yet</p>
        <p className="mt-2 text-sm text-laf-muted">
          Be the first to suggest a resource on our{" "}
          <a href="/library/submit" className="text-laf-gold hover:underline">
            submit page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {contributors.map((c, index) => (
        <li
          key={c.id}
          className="flex items-center gap-4 rounded-2xl border border-laf-border bg-white px-5 py-4"
        >
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              index < 3 ? "bg-laf-gold text-white" : "bg-laf-cream text-laf-navy"
            }`}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-laf-navy truncate">{c.displayName}</p>
            <p className="text-xs text-laf-muted">
              {c.contributionCount} approved {c.contributionCount === 1 ? "resource" : "resources"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
