import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import YoungInnovatorsSubmitForm from "@/components/innovators/YoungInnovatorsSubmitForm";
import { pageMetadata } from "@/lib/seo";
import {
  YOUNG_INNOVATORS_DATES,
  YOUNG_INNOVATORS_OG_IMAGE,
  YOUNG_INNOVATORS_PROMO_ALT,
} from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Submit — Young Innovators Challenge 2026",
  description:
    "Verify your email, then submit 2 photos and a 1-minute video for the LAF Young Innovators Challenge. Free, ages 6–16.",
  path: "/events/young-innovators/submit",
  image: YOUNG_INNOVATORS_OG_IMAGE,
  imageAlt: YOUNG_INNOVATORS_PROMO_ALT,
  imageWidth: 1280,
  imageHeight: 720,
});

export default function YoungInnovatorsSubmitPage() {
  return (
    <>
      <PageHeader title="Submit your project" />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink href="/events/young-innovators" label="Back to Young Innovators Challenge" />
        <p className="mt-4 mb-8 text-laf-muted max-w-2xl leading-relaxed">
          Young Innovators Challenge 2026 ({YOUNG_INNOVATORS_DATES.label}). First verify your email
          with a one-time code (no password). Then upload at least one photo (second photo and video
          link are optional). Projects appear in the{" "}
          <a href="/events/young-innovators/gallery" className="text-laf-gold hover:underline">
            gallery
          </a>{" "}
          after LAF review. We email certificates for valid entries.
        </p>
        <YoungInnovatorsSubmitForm />
      </PageContainer>
    </>
  );
}
