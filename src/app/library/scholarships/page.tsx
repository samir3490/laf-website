import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
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
      <PageHeader
        title="Scholarship Library"
        subtitle="Find scholarships and education funding opportunities across India"
      />
      <PageContainer className="py-12 lg:py-16">
        <p className="mb-8 text-laf-muted leading-relaxed max-w-3xl">
          Official portals and trusted platforms to discover scholarships. Always verify eligibility
          and deadlines on the provider&apos;s website before applying.
        </p>
        <LibraryBrowser seedResources={seedResources} initialModule="scholarships" />
      </PageContainer>
    </>
  );
}
