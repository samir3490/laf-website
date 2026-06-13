import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import ScratchGamesApp from "@/components/scratch/ScratchGamesApp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Scratch Games Showcase",
  description:
    "Browse and play Scratch games shared by the community. No login required to play — sign in only to publish your own MIT Scratch projects.",
  path: "/events/scratch-games",
});

export default function EventsScratchGamesPage() {
  return (
    <>
      <PageHeader
        title="Scratch Games Showcase"
        subtitle="Play games built with MIT Scratch — no login needed. Sign up to share your own projects"
      />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink />
        <ScratchGamesApp />
      </PageContainer>
    </>
  );
}
