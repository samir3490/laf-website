import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import YoungInnovatorsSubmitForm from "@/components/innovators/YoungInnovatorsSubmitForm";
import { pageMetadata } from "@/lib/seo";
import { YOUNG_INNOVATORS_DATES } from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Submit — Young Innovators Challenge 2026",
  description:
    "Submit 2 photos and a 1-minute video for the LAF Young Innovators Challenge. Free, ages 6–16, no account required.",
  path: "/events/young-innovators/submit",
});

export default function YoungInnovatorsSubmitPage() {
  return (
    <>
      <PageHeader title="Submit your project" />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink href="/events/young-innovators" label="Back to Young Innovators Challenge" />
        <p className="mt-4 mb-8 text-laf-muted max-w-2xl leading-relaxed">
          Young Innovators Challenge 2026 ({YOUNG_INNOVATORS_DATES.label}). Upload two photos (saved
          to LAF Google Drive) and paste a YouTube or Drive link to your short explanation video. We
          email digital certificates after review.
        </p>
        <YoungInnovatorsSubmitForm />
      </PageContainer>
    </>
  );
}
