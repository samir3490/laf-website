import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Robotics Learning Library",
  description:
    "Free robotics and coding resources — Scratch, Tinkercad, Arduino, MIT App Inventor, and more.",
  path: "/library/robotics",
});

export default function LibraryRoboticsPage() {
  const seedResources = getSeedLibraryResources();

  return (
    <>
      <PageHeader
        title="Robotics Learning Library"
        subtitle="From Scratch to Arduino — curated robotics and maker resources"
      />
      <PageContainer className="py-12 lg:py-16">
        <LibraryBrowser seedResources={seedResources} initialModule="robotics" />
      </PageContainer>
    </>
  );
}
