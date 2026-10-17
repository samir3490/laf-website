import type { Metadata } from "next";
import DrawingSubmitPageClient from "./DrawingSubmitPageClient";
import { pageMetadata } from "@/lib/seo";
import {
  DRAWING_COMPETITION_DATES,
  DRAWING_COMPETITION_OG_IMAGE,
  DRAWING_COMPETITION_PROMO_ALT,
} from "@/lib/drawing-competition-promo";

export const metadata: Metadata = pageMetadata({
  title: "Submit Artwork — Drawing Competition",
  description: `Upload your painting or drawing to the LAF Drawing Competition (${DRAWING_COMPETITION_DATES.label}).`,
  path: "/events/drawing-competition/submit",
  image: DRAWING_COMPETITION_OG_IMAGE,
  imageAlt: DRAWING_COMPETITION_PROMO_ALT,
  imageWidth: 1536,
  imageHeight: 1024,
});

export default function DrawingSubmitPage() {
  return <DrawingSubmitPageClient />;
}
