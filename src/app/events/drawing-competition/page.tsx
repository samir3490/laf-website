import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import JsonLd from "@/components/JsonLd";
import DrawingAnalytics from "@/components/drawing/DrawingAnalytics";
import DrawingCompetitionApp from "@/components/drawing/DrawingCompetitionApp";
import DrawingCompetitionBanner from "@/components/drawing/DrawingCompetitionBanner";
import { eventJsonLd, pageMetadata } from "@/lib/seo";
import {
  DRAWING_COMPETITION_DATES,
  DRAWING_COMPETITION_OG_IMAGE,
  DRAWING_COMPETITION_PROMO_ALT,
  DRAWING_COMPETITION_THEME,
} from "@/lib/drawing-competition-promo";

const DRAWING_DESCRIPTION = `Submit your artwork and vote in the Lata Agrawal Foundation drawing competition (${DRAWING_COMPETITION_DATES.label}). Theme: ${DRAWING_COMPETITION_THEME}. Celebrate creativity in education and community.`;

export const metadata: Metadata = pageMetadata({
  title: "Drawing Competition",
  description: DRAWING_DESCRIPTION,
  path: "/events/drawing-competition",
  image: DRAWING_COMPETITION_OG_IMAGE,
  imageAlt: DRAWING_COMPETITION_PROMO_ALT,
  imageWidth: 1536,
  imageHeight: 1024,
});

export default function DrawingCompetitionPage() {
  return (
    <>
      <JsonLd
        data={eventJsonLd({
          name: "LAF Drawing Competition 2026",
          description: DRAWING_DESCRIPTION,
          path: "/events/drawing-competition",
          startDate: DRAWING_COMPETITION_DATES.startIso,
          endDate: DRAWING_COMPETITION_DATES.endIso,
          image: DRAWING_COMPETITION_OG_IMAGE,
        })}
      />
      <DrawingAnalytics page="gallery" />
      <PageHeader title="Drawing Competition" />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink />
        <DrawingCompetitionBanner variant="gallery" />
        <Suspense fallback={<p className="text-sm text-laf-muted">Loading competition…</p>}>
          <DrawingCompetitionApp />
        </Suspense>
      </PageContainer>
    </>
  );
}
