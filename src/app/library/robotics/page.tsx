import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import LibraryPageShell from "@/components/library/LibraryPageShell";
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
        <LibraryPageShell
          seedResources={seedResources}
          intro={
            <p className="text-sm text-laf-muted">
              From Scratch to Arduino — curated robotics and maker resources.
            </p>
          }
        >
          <LibraryBrowser seedResources={seedResources} initialModule="robotics" />
        </LibraryPageShell>
      </PageContainer>
    </>
  );
}
