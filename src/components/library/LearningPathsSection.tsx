import Link from "next/link";
import { getLearningPaths } from "@/lib/library-paths";

export default function LearningPathsSection() {
  const paths = getLearningPaths();

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-laf-navy">Learning paths</h2>
          <p className="text-sm text-laf-muted mt-1">
            Curated step-by-step journeys — start where you are, grow at your pace.
          </p>
        </div>
        <Link href="/library/paths" className="text-sm font-medium text-laf-gold hover:underline">
          View all paths →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => (
          <Link
            key={path.id}
            href={`/library/paths/${path.id}`}
            className="rounded-2xl border border-laf-border bg-white p-5 hover:border-laf-gold/50 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-laf-navy">{path.title}</h3>
            <p className="mt-2 text-sm text-laf-muted line-clamp-2">{path.description}</p>
            <p className="mt-3 text-xs text-laf-gold font-medium">{path.steps.length} steps →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
