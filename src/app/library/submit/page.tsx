import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import SubmitResourceForm from "@/components/library/SubmitResourceForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Suggest a Learning Resource",
  description:
    "Submit a useful educational website to the Lata Agrawal Foundation Learning Resource Library.",
  path: "/library/submit",
});

export default function LibrarySubmitPage() {
  return (
    <>
      <PageHeader
        title="Suggest a Resource"
        subtitle="Help us grow India's free educational resource directory"
      />
      <PageContainer className="py-12 lg:py-16">
        <SubmitResourceForm />
      </PageContainer>
    </>
  );
}
