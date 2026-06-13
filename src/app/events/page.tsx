import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventsHub from "@/components/events/EventsHub";
import { pageMetadata } from "@/lib/seo";
import { DRAWING_COMPETITION_DATES } from "@/lib/drawing-competition-promo";

export const metadata: Metadata = pageMetadata({
  title: "Events & Competitions",
  description:
    `Join LAF events — Drawing Competition (${DRAWING_COMPETITION_DATES.label}), Scratch games, and more for children across India.`,
  path: "/events",
});

export default function EventsPage() {
  return (
    <>
      <PageHeader title="Events & Competitions" />
      <PageContainer className="py-12 lg:py-16">
        <EventsHub />
      </PageContainer>
    </>
  );
}
