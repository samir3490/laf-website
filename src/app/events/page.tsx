import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventsHub from "@/components/events/EventsHub";
import { pageMetadata } from "@/lib/seo";
import { YOUNG_INNOVATORS_DATES } from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Events & Competitions",
  description:
    `Join LAF events — Young Innovators Challenge (${YOUNG_INNOVATORS_DATES.labelShort}), Drawing Competition, Scratch games, and more for children across India.`,
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
