import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Lata Agrawal Foundation website and online services.",
  path: "/terms-conditions",
});

export default function TermsPage() {
  const page = getPage("terms-conditions");
  return (
    <>
      <PageHeader title="Terms & Conditions" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page && <WpContent html={page.html} />}
      </div>
    </>
  );
}
