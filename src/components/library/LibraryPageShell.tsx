import Link from "next/link";
import LibrarySidebarNav from "@/components/library/LibrarySidebarNav";
import LibraryTopResources from "@/components/library/LibraryTopResources";
import LibraryVisitCounter from "@/components/library/LibraryVisitCounter";
import type { LibraryResource } from "@/lib/library";

type LibraryPageShellProps = {
  children: React.ReactNode;
  seedResources: LibraryResource[];
  intro?: React.ReactNode;
  /** Optional search / filter controls for the left sidebar */
  sidebarSearch?: React.ReactNode;
  showSuggestCta?: boolean;
};

export default function LibraryPageShell({
  children,
  seedResources,
  intro,
  sidebarSearch,
  showSuggestCta = true,
}: LibraryPageShellProps) {
  return (
    <div className="space-y-6">
      {showSuggestCta && (
        <div className="rounded-2xl border border-laf-gold/40 bg-gradient-to-r from-laf-cream to-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-bold text-laf-navy">Know a great free learning site?</p>
            <p className="text-sm text-laf-muted leading-relaxed">
              Suggest a resource for students, teachers, and volunteers. We review every submission.
            </p>
            <LibraryVisitCounter />
          </div>
          <Link
            href="/library/submit"
            className="shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors shadow-sm"
          >
            Suggest a resource
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px] gap-6 xl:gap-8 items-start">
        <div className="hidden lg:block sticky top-24 space-y-6 rounded-2xl border border-laf-border bg-white p-5">
          <LibrarySidebarNav searchSlot={sidebarSearch} />
        </div>

        <div className="min-w-0 space-y-6">
          {intro}
          {children}
        </div>

        <div className="hidden xl:block sticky top-24">
          <LibraryTopResources seedResources={seedResources} />
        </div>

        <div className="lg:hidden rounded-2xl border border-laf-border bg-white p-4 space-y-6">
          <LibrarySidebarNav searchSlot={sidebarSearch} />
        </div>
      </div>
    </div>
  );
}
