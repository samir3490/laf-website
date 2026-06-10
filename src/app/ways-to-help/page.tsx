import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import Button from "@/components/Button";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ways to Help",
  description: "Discover how you can support the Lata Agrawal Foundation.",
};

export default function WaysToHelpPage() {
  const page = getPage("service-we-provide");

  return (
    <>
      <PageHeader title="Ways to Help" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page ? (
          <WpContent html={page.html} />
        ) : (
          <p className="text-laf-muted leading-relaxed">
            You can support our mission by donating, volunteering, or spreading the word
            about our programs.
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button href="/donate">Donate</Button>
          <Button href="/volunteer" variant="outline">Volunteer</Button>
        </div>
      </div>
    </>
  );
}
