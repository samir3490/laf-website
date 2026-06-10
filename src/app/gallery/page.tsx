import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import PhotoGallery from "@/components/gallery/PhotoGallery";
import { getGalleryData } from "@/lib/gallery-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Photo Gallery",
  description:
    "Photos from Lata Agrawal Foundation programs — education, food drives, health camps, and community events across India.",
  path: "/gallery",
});

export default function GalleryPage() {
  const { intro, categories, images } = getGalleryData();

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        subtitle="Snapshots from our education, health, and community programs"
      />
      <PageContainer wide className="py-8 lg:py-12">
        <PhotoGallery intro={intro} categories={categories} images={images} />
      </PageContainer>
    </>
  );
}
