import type { Metadata } from "next";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Learning Theme Preview",
    description:
      "Preview a warm, kid-friendly website design for Lata Agrawal Foundation. Revert to the classic site anytime.",
    path: "/preview/learning-theme",
  }),
  robots: { index: false, follow: false },
};

const REFERENCES = [
  {
    name: "Khan Academy",
    url: "https://www.khanacademy.org/",
    note: "Clean cream backgrounds, sparse warm accents, reading-first layout",
  },
  {
    name: "Khan Academy Brand",
    url: "https://brand.khanacademy.org/",
    note: "Tactile learning motifs used sparingly, not over content",
  },
  {
    name: "Pratham",
    url: "https://www.pratham.org/",
    note: "Indian education NGO — warm, trustworthy, professional tone",
  },
  {
    name: "Room to Read",
    url: "https://www.roomtoread.org/",
    note: "Warm nonprofit palette with strong content hierarchy",
  },
  {
    name: "Code.org",
    url: "https://code.org/",
    note: "Subject color stripes on cards, friendly but structured sections",
  },
];

export default function LearningThemePreviewPage() {
  return (
    <PageContainer className="py-12 lg:py-16 pb-32">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-laf-gold">Design preview</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-laf-navy">
          Warm learning theme for LAF
        </h1>
        <p className="mt-4 text-laf-muted leading-relaxed">
          Version 3 — a cleaner direction inspired by leading education nonprofits. Warm and welcoming
          for children, but still professional for parents, donors, and partners. The{" "}
          <strong>classic website stays live</strong> for everyone else until you approve a launch.
        </p>

        <div className="mt-10 rounded-2xl border border-laf-border bg-white p-8 text-left shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-laf-gold">What you will see</p>
          <ul className="mt-4 space-y-2 text-sm text-laf-muted">
            <li>Soft cream background with gentle corner color washes (never over text)</li>
            <li>Navy header with a single gold accent line — no rainbow clutter</li>
            <li>Cards with subtle subject-color left stripes (math, science, nature)</li>
            <li>Light wave dividers between major sections on the home page</li>
            <li>A quiet “Maths · Science · Reading · Careers · Nature” ribbon in the footer</li>
            <li>No floating formulas or spinning diagrams over your content</li>
          </ul>
          <Link
            href="/?theme=playful"
            className="mt-6 inline-flex w-full justify-center px-6 py-3 rounded-xl bg-laf-gold text-white font-semibold hover:bg-laf-gold-bright transition-colors"
          >
            Preview warm learning theme
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/60 p-6 text-left">
          <h2 className="font-bold text-laf-navy text-sm">Design references used</h2>
          <p className="mt-2 text-sm text-laf-muted">
            These sites informed the layout principles — not a copy, but the same balance of warmth
            and readability:
          </p>
          <ul className="mt-4 space-y-3">
            {REFERENCES.map((ref) => (
              <li key={ref.url} className="text-sm">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-laf-navy underline decoration-laf-gold/50 hover:decoration-laf-gold"
                >
                  {ref.name}
                </a>
                <span className="text-laf-muted"> — {ref.note}</span>
              </li>
            ))}
          </ul>
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
            Theme on About
          </Button>
          <Button href="/library?theme=playful" variant="outline">
            Theme on Library
          </Button>
          <Button href="/donate?theme=playful" variant="outline">
            Theme on Donate
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
