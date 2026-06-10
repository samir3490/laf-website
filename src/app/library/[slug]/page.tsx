import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import ResourceDetailView from "@/components/library/ResourceDetailView";
import JsonLd from "@/components/JsonLd";
import { getSeedLibraryResources, getSeedResourceBySlug } from "@/lib/library-data";
import { breadcrumbJsonLd, learningResourceJsonLd, pageMetadata, siteUrl } from "@/lib/seo";

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
    ? [
        learningResourceJsonLd({
          title: seedResource.title,
          description: seedResource.description,
          slug,
          externalUrl: seedResource.url,
        }),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learning Library", path: "/library" },
          { name: seedResource.title, path: `/library/${slug}` },
        ]),
      ]
    : null;

  return (
    <PageContainer className="py-12 lg:py-16">
      {jsonLd?.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
      <ResourceDetailView slug={slug} seedResource={seedResource} />
    </PageContainer>
  );
}
