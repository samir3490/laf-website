import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the Lata Agrawal Foundation mission, vision, and team.",
};

export default function AboutPage() {
  const page = getPage("about-us");
  if (!page) return null;

  return (
    <>
      <PageHeader title="About Us" subtitle="Empowering smiles, changing lives" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <WpContent html={page.html} />
      </div>
    </>
  );
}
