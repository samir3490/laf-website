import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventsHub from "@/components/events/EventsHub";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Events & Competitions",
  description:
    "Join Lata Agrawal Foundation events — drawing competitions, Scratch games showcases, and more for children and learners across India.",
  path: "/events",
});

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events & Competitions"
        subtitle="Create, share, and celebrate together"
      />
      <PageContainer className="py-12 lg:py-16">
        <EventsHub />
      </PageContainer>
    </>
  );
}
