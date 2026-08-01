"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb, LIBRARY_SETTINGS_COLLECTION } from "@/lib/firebase";

const STATS_DOC = "stats";
const SESSION_KEY = "laf_library_page_visit";

/**
 * Tracks one library page visit per browser session and shows total visits.
 */
export default function LibraryVisitCounter() {
  const db = getFirebaseDb();
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    if (!db) return;
    const ref = doc(db, LIBRARY_SETTINGS_COLLECTION, STATS_DOC);

    async function loadAndTrack() {
      try {
        const snap = await getDoc(ref);
        let count = snap.exists() ? Number(snap.data()?.pageVisits ?? 0) : 0;

        let alreadyTracked = false;
        try {
          alreadyTracked = sessionStorage.getItem(SESSION_KEY) === "1";
        } catch {
          /* continue */
        }

        if (!alreadyTracked) {
          try {
            if (snap.exists()) {
              await updateDoc(ref, { pageVisits: increment(1) });
            } else {
              await setDoc(ref, { pageVisits: 1 });
            }
            count += 1;
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {
              /* ignore */
            }
          } catch {
            /* non-blocking if rules not deployed yet */
          }
        }

        setVisits(count);
      } catch {
        setVisits(null);
      }
    }

    void loadAndTrack();
  }, [db]);

  if (visits === null) return null;

  return (
    <p className="text-sm text-laf-muted tabular-nums">
      <span className="font-semibold text-laf-navy">{visits.toLocaleString("en-IN")}</span>
      {" "}
      {visits === 1 ? "person has" : "people have"} visited the library
    </p>
  );
}
