import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryBrowser from "@/components/library/LibraryBrowser";
import { getSeedLibraryResources } from "@/lib/library-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Learning Resource Library",
  description:
    "Free educational websites for students, teachers, volunteers, and parents — coding, robotics, scholarships, science, and more.",
  path: "/library",
});

export default function LibraryPage() {
  const seedResources = getSeedLibraryResources();

  return (
    <>
      <PageHeader
        title="Learning Resource Library"
        subtitle="Curated free learning websites for students, teachers, volunteers, and parents across India"
      />
      <PageContainer className="py-12 lg:py-16">
        <p className="mb-8 text-laf-muted leading-relaxed max-w-3xl">
          Browse trusted educational resources — from Scratch and Khan Academy to scholarships and
          NGO guides. Search by topic, age group, difficulty, or cost. Community submissions with
          AI review will open in a future update.
        </p>
        <LibraryBrowser seedResources={seedResources} />
      </PageContainer>
    </>
  );
}
