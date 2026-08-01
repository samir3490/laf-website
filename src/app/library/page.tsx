import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
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
      <PageHeader title="Learning Resource Library" />
      <PageContainer wide className="py-8 lg:py-12">
        <LibraryBrowser
          seedResources={seedResources}
          intro={
            <p className="text-sm text-laf-muted leading-relaxed">
              Browse {seedResources.length}+ trusted free learning sites — coding, robotics,
              scholarships, science, and more. Use search and filters in the sidebar to narrow
              results.
            </p>
          }
        />
      </PageContainer>
    </>
  );
}
