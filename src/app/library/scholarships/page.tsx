import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import LibraryPageShell from "@/components/library/LibraryPageShell";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Scholarship Library",
  description:
    "Scholarship portals and funding resources for Indian students — eligibility, deadlines, and official application links.",
  path: "/library/scholarships",
});

export default function LibraryScholarshipsPage() {
  const seedResources = getSeedLibraryResources();

  return (
    <>
      <PageHeader title="Scholarship Library" />
      <PageContainer wide className="py-8 lg:py-12">
        <LibraryPageShell
          seedResources={seedResources}
          intro={
            <p className="text-sm text-laf-muted">
              Official portals and trusted platforms. Always verify eligibility and deadlines on the
              provider&apos;s website before applying.
            </p>
          }
        >
          <LibraryBrowser seedResources={seedResources} initialModule="scholarships" />
        </LibraryPageShell>
      </PageContainer>
    </>
  );
}
