import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import LibraryPageShell from "@/components/library/LibraryPageShell";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Learning Resource Library",
  description:
    "Free educational websites for students, teachers, volunteers, and parents — coding, robotics, scholarships, science, and more.",
  path: "/library",
});

export default function LibraryPage() {
  const seedResources = getSeedLibraryResources();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Lata Agrawal Foundation Learning Resource Library",
    description:
      "Free educational websites for students, teachers, volunteers, and parents across India.",
    url: siteUrl("/library"),
    numberOfItems: seedResources.length,
    itemListElement: seedResources.slice(0, 20).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.title,
      url: siteUrl(`/library/${r.slug}`),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <PageHeader
        title="Learning Resource Library"
        subtitle="Curated free learning websites for students, teachers, volunteers, and parents across India"
      />
      <PageContainer wide className="py-8 lg:py-12">
        <LibraryPageShell
          seedResources={seedResources}
          intro={
            <p className="text-sm text-laf-muted leading-relaxed">
              Search {seedResources.length}+ trusted sites — coding, robotics, scholarships, and
              more. Use <strong className="text-laf-navy">Ask the library</strong> or filters below.
            </p>
          }
        >
          <LibraryBrowser seedResources={seedResources} />
        </LibraryPageShell>
      </PageContainer>
    </>
  );
}
