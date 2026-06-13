import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import { getLearningPaths } from "@/lib/library-paths";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Learning Paths",
  description:
    "Step-by-step learning journeys in robotics, coding, English, science, and scholarships.",
  path: "/library/paths",
});

export default function LibraryPathsPage() {
  const paths = getLearningPaths();

  return (
    <>
      <PageHeader title="Learning Paths" />
      <PageContainer className="py-12 lg:py-16">
        <Link href="/library" className="text-sm text-laf-gold hover:underline">
          ← Back to library
        </Link>
        <ul className="mt-8 grid md:grid-cols-2 gap-6">
          {paths.map((path) => (
            <li
              key={path.id}
              className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8"
            >
              <h2 className="text-xl font-bold text-laf-navy">
                <Link href={`/library/paths/${path.id}`} className="hover:text-laf-gold">
                  {path.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-laf-muted">{path.description}</p>
              <ol className="mt-5 space-y-2">
                {path.steps.map((step, i) => (
                  <li key={step.slug} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-laf-cream border border-laf-border flex items-center justify-center text-xs font-semibold text-laf-navy">
                      {i + 1}
                    </span>
                    <Link
                      href={`/library/${step.slug}`}
                      className="text-laf-navy hover:text-laf-gold"
                    >
                      {step.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </PageContainer>
    </>
  );
}
