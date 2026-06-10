import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about the Lata Agrawal Foundation — our mission, vision, and impact in education and community programs across India.",
  path: "/about",
});

export default function AboutPage() {
  const page = getPage("about-us");
  if (!page) return null;

  return (
    <>
      <PageHeader title="About Us" subtitle="Empowering smiles, changing lives" />
      <PageContainer className="py-12 lg:py-16">
        <WpContent html={page.html} />
      </PageContainer>
    </>
  );
}
