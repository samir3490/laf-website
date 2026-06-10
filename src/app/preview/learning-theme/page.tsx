import type { Metadata } from "next";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Learning Theme Preview",
    description:
      "Preview kid-friendly website designs for Lata Agrawal Foundation. Revert to the classic site anytime.",
    path: "/preview/learning-theme",
  }),
  robots: { index: false, follow: false },
};

export default function LearningThemePreviewPage() {
  return (
    <PageContainer className="py-12 lg:py-16 pb-32">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-laf-gold">Design preview</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-laf-navy">
          Learning theme for LAF
        </h1>
        <p className="mt-4 text-laf-muted leading-relaxed">
          A warm, colorful look with handprints, maths, science, career paths, animals, and gentle
          animations — all tucked into the <strong>side margins</strong> so your main text stays easy
          to read. The <strong>classic website stays live</strong> for everyone else until you choose
          to launch.
        </p>

        <div className="mt-10 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-sky-50 to-emerald-50 p-8 text-left shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Recommended preview</p>
          <h2 className="mt-1 text-xl font-bold text-laf-navy">Colorful learning theme</h2>
          <ul className="mt-4 space-y-2 text-sm text-laf-muted">
            <li>Warm gradient in the margins; solid reading column in the center</li>
            <li>Handprints, formulas, atoms, DNA, circuits, animals &amp; diagrams in side gutters only</li>
            <li>On smaller screens, decorations hide so mobile reading stays clean</li>
            <li>Best on a wide monitor — resize the window to see the side art appear</li>
          </ul>
          <Link
            href="/?theme=playful"
            className="mt-6 inline-flex w-full justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-colors"
          >
            Preview colorful theme
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-left">
          <h2 className="font-bold text-laf-navy text-sm">Rollback anytime</h2>
          <p className="mt-2 text-sm text-laf-muted">
            Use <strong>Revert to classic</strong> in the bar at the bottom of any preview page. That
            restores the actual website instantly — nothing changes for other visitors.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/about?theme=playful" variant="outline">
            Colorful theme on About
          </Button>
          <Button href="/library?theme=playful" variant="outline">
            Colorful theme on Library
          </Button>
          <Button href="/donate?theme=playful" variant="outline">
            Colorful theme on Donate
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
