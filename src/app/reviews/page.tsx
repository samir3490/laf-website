import type { Metadata } from "next";
import QRCode from "qrcode";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import GoogleReviewsList from "@/components/reviews/GoogleReviewsList";
import ReviewQrPanel from "@/components/reviews/ReviewQrPanel";
import { getGoogleBusinessConfig, reviewWriteUrl } from "@/lib/google-reviews";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Google Reviews",
  description:
    "Read what supporters say about Lata Agrawal Foundation and leave your own Google review.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const config = getGoogleBusinessConfig();
  const reviewUrl = reviewWriteUrl();

  const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
    width: 440,
    margin: 2,
    color: { dark: "#1a2744", light: "#ffffff" },
  });

  return (
    <>
      <PageHeader
        title="Google Reviews"
        subtitle="Thank you to everyone who shares feedback about our work"
      />
      <PageContainer wide className="py-8 lg:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-12 items-start">
          <GoogleReviewsList
            fallbackMessage={`Reviews from ${config.googleShareUrl} sync daily once Google API credentials are configured on Vercel.`}
          />
          <ReviewQrPanel qrDataUrl={qrDataUrl} reviewUrl={reviewUrl} />
        </div>
      </PageContainer>
    </>
  );
}
