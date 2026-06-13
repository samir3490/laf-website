import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import GoogleReviewsList from "@/components/reviews/GoogleReviewsList";
import ReviewQrPanel from "@/components/reviews/ReviewQrPanel";
import { reviewWriteUrl } from "@/lib/google-reviews";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Google Reviews",
  description:
    "Read what supporters say about Lata Agrawal Foundation and leave your own Google review.",
  path: "/reviews",
});

export default function ReviewsPage() {
  const reviewUrl = reviewWriteUrl();

  return (
    <>
      <PageHeader title="Google Reviews" />
      <PageContainer wide className="py-8 lg:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 xl:gap-12 items-start">
          <GoogleReviewsList />
          <ReviewQrPanel reviewUrl={reviewUrl} />
        </div>
      </PageContainer>
    </>
  );
}
