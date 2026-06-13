import type { Metadata } from "next";
import DrawingSubmitPageClient from "./DrawingSubmitPageClient";
import { pageMetadata } from "@/lib/seo";
import { DRAWING_COMPETITION_DATES } from "@/lib/drawing-competition-promo";

export const metadata: Metadata = pageMetadata({
  title: "Submit Artwork — Drawing Competition",
  description: `Upload your painting or drawing to the LAF Drawing Competition (${DRAWING_COMPETITION_DATES.label}).`,
  path: "/events/drawing-competition/submit",
});

export default function DrawingSubmitPage() {
  return <DrawingSubmitPageClient />;
}
