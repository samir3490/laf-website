import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import DrawingAnalytics from "@/components/drawing/DrawingAnalytics";
import DrawingCompetitionApp from "@/components/drawing/DrawingCompetitionApp";
import DrawingCompetitionBanner from "@/components/drawing/DrawingCompetitionBanner";
import { pageMetadata } from "@/lib/seo";
import { DRAWING_COMPETITION_DATES } from "@/lib/drawing-competition-promo";

export const metadata: Metadata = pageMetadata({
  title: "Drawing Competition",
  description:
    `Submit your artwork and vote in the Lata Agrawal Foundation drawing competition (${DRAWING_COMPETITION_DATES.label}). Celebrate creativity in education and community.`,
  path: "/events/drawing-competition",
});

export default function DrawingCompetitionPage() {
  return (
    <>
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
