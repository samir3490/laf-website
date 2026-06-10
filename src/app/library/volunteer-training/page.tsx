import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Volunteer Training Library",
  description:
    "Resources for volunteers — child safety, communication skills, digital literacy, and community training.",
  path: "/library/volunteer-training",
});

export default function LibraryVolunteerPage() {
  const seedResources = getSeedLibraryResources();

  return (
    <>
      <PageHeader
        title="Volunteer Training Library"
        subtitle="Guides and courses for volunteers working with children and communities"
      />
      <PageContainer className="py-12 lg:py-16">
        <LibraryBrowser seedResources={seedResources} initialModule="volunteer" />
      </PageContainer>
    </>
  );
}
