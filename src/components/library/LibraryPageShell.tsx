import LibrarySidebarNav from "@/components/library/LibrarySidebarNav";
import LibraryTopResources from "@/components/library/LibraryTopResources";
import type { LibraryResource } from "@/lib/library";

type LibraryPageShellProps = {
  children: React.ReactNode;
  seedResources: LibraryResource[];
  intro?: React.ReactNode;
};

export default function LibraryPageShell({
  children,
  seedResources,
  intro,
}: LibraryPageShellProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px] gap-6 xl:gap-8 items-start">
      <div className="hidden lg:block sticky top-24">
        <LibrarySidebarNav />
      </div>

      <div className="min-w-0 space-y-6">
        {intro}
        {children}
      </div>

      <div className="hidden xl:block sticky top-24">
        <LibraryTopResources seedResources={seedResources} />
      </div>

      <div className="lg:hidden rounded-2xl border border-laf-border bg-white p-4">
        <LibrarySidebarNav />
      </div>
    </div>
  );
}
