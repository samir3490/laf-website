import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import YoungInnovatorsGallery from "@/components/innovators/YoungInnovatorsGallery";
import YoungInnovatorsPageTracker from "@/components/innovators/YoungInnovatorsPageTracker";
import { pageMetadata } from "@/lib/seo";
import {
  YOUNG_INNOVATORS_PROMO_ALT,
  YOUNG_INNOVATORS_PROMO_IMAGE,
} from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Gallery & vote — Young Innovators Challenge 2026",
  description:
    "Browse approved Young Innovators Challenge projects. Sign in with Google to vote. Free online challenge for ages 6–16 by Lata Agrawal Foundation.",
  path: "/events/young-innovators/gallery",
  image: YOUNG_INNOVATORS_PROMO_IMAGE,
  imageAlt: YOUNG_INNOVATORS_PROMO_ALT,
  imageWidth: 1280,
  imageHeight: 720,
});

export default function YoungInnovatorsGalleryPage() {
  return (
    <>
      <YoungInnovatorsPageTracker page="gallery" />
      <PageHeader title="Young Innovators gallery" />
      <PageContainer className="py-12 lg:py-16">
        <EventBackLink href="/events/young-innovators" label="Back to Young Innovators Challenge" />
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-laf-muted">Loading gallery…</p>}>
            <YoungInnovatorsGallery />
          </Suspense>
        </div>
      </PageContainer>
    </>
  );
}
