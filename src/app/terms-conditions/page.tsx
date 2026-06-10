import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Terms & Conditions" };

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
