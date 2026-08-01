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
      <PageHeader title="Robotics Learning Library" />
      <PageContainer wide className="py-8 lg:py-12">
        <LibraryBrowser
          seedResources={seedResources}
          initialModule="robotics"
          intro={
            <p className="text-sm text-laf-muted">
              Scratch, Arduino, Tinkercad, and other free robotics and maker resources.
            </p>
          }
        />
      </PageContainer>
    </>
  );
}
