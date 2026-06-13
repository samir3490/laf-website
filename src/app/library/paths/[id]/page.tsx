import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import { getLearningPath, getLearningPaths } from "@/lib/library-paths";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return getLearningPaths().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = getLearningPath(id);
  if (!path) return { title: "Learning Path" };

  return pageMetadata({
    title: `${path.title} — Learning Path`,
    description: path.description,
    path: `/library/paths/${id}`,
  });
}

export default async function LearningPathPage({ params }: Props) {
  const { id } = await params;
  const path = getLearningPath(id);
  if (!path) notFound();

  return (
    <>
      <PageHeader title={path.title} />
      <PageContainer className="py-12 lg:py-16 max-w-2xl">
        <Link href="/library/paths" className="text-sm text-laf-gold hover:underline">
          ← All learning paths
        </Link>
        <ol className="mt-8 space-y-4">
          {path.steps.map((step, i) => (
            <li
              key={step.slug}
              className="flex gap-4 rounded-2xl border border-laf-border bg-white p-5"
            >
              <span className="shrink-0 w-10 h-10 rounded-full bg-laf-gold text-white flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <div>
                <Link
                  href={`/library/${step.slug}`}
                  className="font-semibold text-laf-navy hover:text-laf-gold"
                >
                  {step.label}
                </Link>
                <p className="mt-1 text-xs text-laf-muted">
                  <Link href={`/library/${step.slug}`} className="hover:underline">
                    View resource →
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ol>
        {path.steps[0] && (
          <Link
            href={`/library/${path.steps[0].slug}`}
            className="inline-block mt-8 px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright"
          >
            Start path →
          </Link>
        )}
      </PageContainer>
    </>
  );
}
