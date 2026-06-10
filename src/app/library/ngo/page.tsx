import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import LibraryPageShell from "@/components/library/LibraryPageShell";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "NGO Knowledge Library",
  description:
    "Resources for NGOs — fundraising, compliance, transparency, and volunteer management.",
  path: "/library/ngo",
});

export default function LibraryNgoPage() {
  const seedResources = getSeedLibraryResources();

  return (
    <>
      <PageHeader
        title="NGO Knowledge Library"
        subtitle="Guides and tools for nonprofits, CSR partners, and community organizations"
      />
      <PageContainer wide className="py-8 lg:py-12">
        <LibraryPageShell
          seedResources={seedResources}
          intro={
            <p className="text-sm text-laf-muted">
              Transparency, compliance, and partnership resources for NGOs and volunteers.
            </p>
          }
        >
          <LibraryBrowser
            seedResources={seedResources}
            initialModule="ngo"
            showSmartSearch={false}
          />
        </LibraryPageShell>
      </PageContainer>
    </>
  );
}
