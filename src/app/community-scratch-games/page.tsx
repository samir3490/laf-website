import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import ScratchGamesApp from "@/components/scratch/ScratchGamesApp";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Community Scratch Games",
  description:
    "Browse and play Scratch games shared by the community. Sign in to publish your own MIT Scratch projects.",
  path: "/community-scratch-games",
});

export default function CommunityScratchGamesPage() {
  return (
    <>
      <PageHeader title="Community Scratch Games" />
      <PageContainer className="py-12 lg:py-16">
        <ScratchGamesApp />
      </PageContainer>
    </>
  );
}
