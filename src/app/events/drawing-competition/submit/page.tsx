import type { Metadata } from "next";
import DrawingSubmitPageClient from "./DrawingSubmitPageClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Submit Artwork — Drawing Competition",
  description: "Upload your painting or drawing to the Lata Agrawal Foundation drawing competition.",
  path: "/events/drawing-competition/submit",
});

export default function DrawingSubmitPage() {
  return <DrawingSubmitPageClient />;
}
