"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import DrawingAnalytics from "@/components/drawing/DrawingAnalytics";
import DrawingCompetitionBanner from "@/components/drawing/DrawingCompetitionBanner";
import SubmitDrawingForm from "@/components/drawing/SubmitDrawingForm";
import {
  competitionPhase,
  DRAWING_COMPETITION_COLLECTION,
  DRAWING_META_DOC_ID,
  normalizeCompetitionMeta,
} from "@/lib/drawing";
import { getFirebaseConfig, getFirebaseDb } from "@/lib/firebase";

export default function DrawingSubmitPageClient() {
  const db = getFirebaseDb();
  const config = getFirebaseConfig();
  const [submissionsAllowed, setSubmissionsAllowed] = useState(true);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(doc(db, DRAWING_COMPETITION_COLLECTION, DRAWING_META_DOC_ID), (snap) => {
      const meta = normalizeCompetitionMeta(snap.data() as Record<string, unknown> | undefined);
      setSubmissionsAllowed(competitionPhase(meta).submissionsAllowed);
    });
  }, [db]);

  return (
    <>
      <DrawingAnalytics page="submit" />
      <PageHeader title="Submit Artwork" />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink />
        {!config ? (
          <p className="text-sm text-laf-muted">Firebase setup required.</p>
        ) : (
          <>
            <DrawingCompetitionBanner variant="submit" />
            <SubmitDrawingForm submissionsAllowed={submissionsAllowed} />
          </>
        )}
      </PageContainer>
    </>
  );
}
