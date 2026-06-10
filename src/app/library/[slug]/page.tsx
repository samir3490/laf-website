import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import ResourceDetailView from "@/components/library/ResourceDetailView";
import { getSeedLibraryResources, getSeedResourceBySlug } from "@/lib/library-data";
import { pageMetadata, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getSeedLibraryResources().map((r) => ({ slug: r.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = getSeedResourceBySlug(slug);

  return pageMetadata({
    title: resource?.title ?? "Learning Resource",
    description: resource?.description.slice(0, 160) ?? "Educational resource from the LAF Learning Library.",
    path: `/library/${slug}`,
  });
}

export default async function LibraryResourcePage({ params }: Props) {
  const { slug } = await params;
  const seedResource = getSeedResourceBySlug(slug) ?? null;

  const jsonLd = seedResource
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: seedResource.title,
        description: seedResource.description,
        url: siteUrl(`/library/${slug}`),
        isPartOf: { "@type": "WebSite", name: "Lata Agrawal Foundation Learning Library" },
      }
    : null;

  return (
    <PageContainer className="py-12 lg:py-16">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ResourceDetailView slug={slug} seedResource={seedResource} />
    </PageContainer>
  );
}
