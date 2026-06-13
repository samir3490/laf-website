import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import DrawingCompetitionApp from "@/components/drawing/DrawingCompetitionApp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Drawing Competition",
  description:
    "Submit your artwork and vote in the Lata Agrawal Foundation drawing competition. Celebrate creativity in education and community.",
  path: "/events/drawing-competition",
});

export default function DrawingCompetitionPage() {
  return (
    <>
      <PageHeader
        title="Drawing Competition"
        subtitle="Share your artwork and vote for your favourites"
      />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink />
        <Suspense fallback={<p className="text-sm text-laf-muted">Loading competition…</p>}>
          <DrawingCompetitionApp />
        </Suspense>
      </PageContainer>
    </>
  );
}
