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
          Learning themes for LAF
        </h1>
        <p className="mt-4 text-laf-muted leading-relaxed">
          Try a kid-friendly look with handprints, maths, science, career paths, animals, and gentle
          animations. The <strong>classic website stays live</strong> for everyone else until you choose
          to launch a theme.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-600">Recommended</p>
            <h2 className="mt-1 font-bold text-laf-navy">Soft white theme</h2>
            <ul className="mt-3 space-y-2 text-sm text-laf-muted">
              <li>White background, soft pastel handprints</li>
              <li>Maths, physics, chemistry, biology formulas</li>
              <li>Career, English, animals &amp; diagrams</li>
              <li>Atom, DNA, graphs, circuits, beakers</li>
            </ul>
            <Link
              href="/?theme=playful-soft"
              className="mt-5 inline-flex w-full justify-center px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
            >
              Preview soft white theme
            </Link>
          </div>
          <div className="rounded-2xl border border-laf-border bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-laf-muted">Earlier try</p>
            <h2 className="mt-1 font-bold text-laf-navy">Colorful gradient theme</h2>
            <ul className="mt-3 space-y-2 text-sm text-laf-muted">
              <li>Warm gradient background</li>
              <li>Lighter doodle set (first preview)</li>
            </ul>
            <Link
              href="/?theme=playful"
              className="mt-5 inline-flex w-full justify-center px-6 py-3 rounded-xl border border-laf-navy/20 font-semibold text-laf-navy hover:bg-laf-cream transition-colors"
            >
              Preview colorful theme
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-left">
          <h2 className="font-bold text-laf-navy text-sm">Rollback anytime</h2>
          <p className="mt-2 text-sm text-laf-muted">
            Use <strong>Revert to classic</strong> in the bar at the bottom of any preview page. That
            restores the actual website instantly — nothing changes for other visitors.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/about?theme=playful-soft" variant="outline">
            Soft theme on About
          </Button>
          <Button href="/library?theme=playful-soft" variant="outline">
            Soft theme on Library
          </Button>
          <Button href="/donate?theme=playful-soft" variant="outline">
            Soft theme on Donate
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
