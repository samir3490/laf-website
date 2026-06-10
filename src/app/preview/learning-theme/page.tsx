import type { Metadata } from "next";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Learning Theme Preview",
    description:
      "Preview a playful, kid-friendly design for the Lata Agrawal Foundation website. Revert to the classic theme anytime.",
    path: "/preview/learning-theme",
  }),
  robots: { index: false, follow: false },
};

export default function LearningThemePreviewPage() {
  return (
    <PageContainer className="py-12 lg:py-16 pb-32">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">Design preview</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-laf-navy">
          Playful learning theme for LAF
        </h1>
        <p className="mt-4 text-laf-muted leading-relaxed">
          A warmer, kid-friendly look with handprints, science doodles, animals, and gentle animations —
          while keeping our navy and gold brand. This preview is{" "}
          <strong>only visible to you</strong> until you ask us to launch it for everyone.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
          <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/80 p-6">
            <h2 className="font-bold text-laf-navy">What you&apos;ll see</h2>
            <ul className="mt-3 space-y-2 text-sm text-laf-muted">
              <li>✋ Painted handprints &amp; learning doodles</li>
              <li>⚗️ Chemistry &amp; physics formulas in the background</li>
              <li>🐘 Animals, books, and science icons</li>
              <li>🎨 Brighter accent colors &amp; soft motion</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-6">
            <h2 className="font-bold text-laf-navy">Safe rollback</h2>
            <ul className="mt-3 space-y-2 text-sm text-laf-muted">
              <li>Classic site stays default for all visitors</li>
              <li>Use <strong>Revert to classic</strong> anytime</li>
              <li>No permanent change until you approve</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/?theme=playful"
            className="inline-flex px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-semibold shadow-lg hover:opacity-95 transition-opacity"
          >
            Open preview on homepage
          </Link>
          <Button href="/about?theme=playful" variant="outline">
            Preview on About
          </Button>
          <Button href="/library?theme=playful" variant="outline">
            Preview on Library
          </Button>
        </div>

        <p className="mt-8 text-xs text-laf-muted">
          Tip: use the bar at the bottom of any page to revert or keep exploring the preview.
        </p>
      </div>
    </PageContainer>
  );
}
