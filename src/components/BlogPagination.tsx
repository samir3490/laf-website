import Link from "next/link";

const PER_PAGE = 12;

export function blogPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PER_PAGE));
}

export { PER_PAGE as BLOG_PER_PAGE };

export default function BlogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
      {prev ? (
        <Link
          href={prev === 1 ? "/blog" : `/blog?page=${prev}`}
          className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:border-laf-gold hover:text-laf-gold transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-laf-border/50 text-sm text-laf-muted/50">
          ← Previous
        </span>
      )}

      <span className="px-4 py-2 text-sm text-laf-muted">
        Page {page} of {totalPages}
      </span>

      {next ? (
        <Link
          href={`/blog?page=${next}`}
          className="px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:border-laf-gold hover:text-laf-gold transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg border border-laf-border/50 text-sm text-laf-muted/50">
          Next →
        </span>
      )}
    </nav>
  );
}
