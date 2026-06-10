"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { faviconUrl, normalizeLibraryResource, type LibraryResource } from "@/lib/library";
import {
  getFirebaseDb,
  LIBRARY_RESOURCES_COLLECTION,
} from "@/lib/firebase";

type LibraryTopResourcesProps = {
  seedResources: LibraryResource[];
  title?: string;
};

export default function LibraryTopResources({
  seedResources,
  title = "Popular resources",
}: LibraryTopResourcesProps) {
  const db = getFirebaseDb();
  const [resources, setResources] = useState<LibraryResource[]>(seedResources);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, LIBRARY_RESOURCES_COLLECTION), (snap) => {
      const list = snap.docs
        .map((d) => normalizeLibraryResource(d.data() as Record<string, unknown>, d.id))
        .filter((r): r is LibraryResource => r !== null);
      if (list.length > 0) setResources(list);
    });
    return unsub;
  }, [db]);

  const top = useMemo(() => {
    return [...resources]
      .sort((a, b) => {
        const visits = (b.visitCount ?? 0) - (a.visitCount ?? 0);
        if (visits !== 0) return visits;
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (b.educationalScore ?? 0) - (a.educationalScore ?? 0);
      })
      .slice(0, 10);
  }, [resources]);

  return (
    <aside aria-label={title}>
      <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {top.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/library/${r.slug}`}
              className="flex items-center gap-2.5 group rounded-lg border border-laf-border bg-white px-2.5 py-2 hover:border-laf-gold/40 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.favicon || faviconUrl(r.url)}
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 rounded shrink-0"
              />
              <span className="text-xs text-laf-navy group-hover:text-laf-gold leading-snug line-clamp-2">
                {r.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
