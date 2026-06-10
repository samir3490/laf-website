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
        <p className="mb-4 text-laf-muted leading-relaxed max-w-3xl">
          Browse trusted educational resources — from Scratch and Khan Academy to scholarships and
          NGO guides. Search by topic, age group, difficulty, or cost. Know a great site?{" "}
          <a href="/library/submit" className="text-laf-gold font-medium hover:underline">
            Suggest a resource
          </a>
          .
        </p>
        <div className="mb-8 flex flex-wrap gap-3 text-sm">
          <a href="/library/robotics" className="px-3 py-1.5 rounded-lg border border-laf-border text-laf-navy hover:bg-laf-cream">
            Robotics →
          </a>
          <a href="/library/scholarships" className="px-3 py-1.5 rounded-lg border border-laf-border text-laf-navy hover:bg-laf-cream">
            Scholarships →
          </a>
          <a href="/library/volunteer-training" className="px-3 py-1.5 rounded-lg border border-laf-border text-laf-navy hover:bg-laf-cream">
            Volunteer Training →
          </a>
        </div>
        <LibraryBrowser seedResources={seedResources} />
      </PageContainer>
    </>
  );
}
