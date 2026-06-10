import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const page = getPage("privacy-policy");
  return (
    <>
      <PageHeader title="Privacy Policy" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page && <WpContent html={page.html} />}
        <p className="mt-10 pt-6 border-t border-laf-border text-sm text-laf-muted leading-relaxed">
          <strong className="text-laf-navy">Learning Resource Library:</strong> When you suggest a
          resource, we fetch public metadata (title, description, homepage text) from the URL you
          provide to review and categorize it. We do not crawl entire websites or store personal
          data from third-party sites.
        </p>
      </div>
    </>
  );
}
