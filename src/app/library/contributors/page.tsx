import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import LibraryContributorsList from "@/components/library/LibraryContributorsList";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Top Library Contributors",
  description:
    "Community members who helped grow the Lata Agrawal Foundation Learning Resource Library.",
  path: "/library/contributors",
});

export default function LibraryContributorsPage() {
  return (
    <>
      <PageHeader
        title="Top Contributors"
        subtitle="Thank you to everyone who suggests quality learning resources"
      />
      <PageContainer className="py-8 lg:py-12 max-w-2xl">
        <p className="text-sm text-laf-muted mb-8 leading-relaxed">
          Only human-approved submissions count. Names are shown as you choose on the{" "}
          <Link href="/library/submit" className="text-laf-gold hover:underline">
            submit form
          </Link>
          , or a privacy-safe label if you leave name blank.
        </p>
        <LibraryContributorsList />
      </PageContainer>
    </>
  );
}
