import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about the Lata Agrawal Foundation.",
};

export default function FaqPage() {
  const page = getPage("faq");

  return (
    <>
      <PageHeader title="FAQs" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page ? (
          <WpContent html={page.html} />
        ) : (
          <p className="text-laf-muted">
            FAQ content will be added soon. Please{" "}
            <a href="/contact" className="text-laf-gold underline">contact us</a>{" "}
            with any questions.
          </p>
        )}
      </div>
    </>
  );
}
