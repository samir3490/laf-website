"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import ResourceCard from "@/components/library/ResourceCard";
import {
  DEFAULT_LIBRARY_FILTERS,
  filterLibraryResources,
  LIBRARY_AGE_GROUPS,
  LIBRARY_CATEGORIES,
  LIBRARY_COSTS,
  LIBRARY_DIFFICULTIES,
  LIBRARY_MODULES,
  moduleLabel,
  normalizeLibraryResource,
  type LibraryFilters,
  type LibraryResource,
} from "@/lib/library";
import {
  getFirebaseConfig,
  getFirebaseDb,
  LIBRARY_RESOURCES_COLLECTION,
} from "@/lib/firebase";

type LibraryBrowserProps = {
  seedResources: LibraryResource[];
  initialModule?: string;
  showSubmitLink?: boolean;
};

const MODULE_TABS = [
  { value: "", label: "All" },
  ...LIBRARY_MODULES.map((m) => ({ value: m, label: moduleLabel(m) })),
];

export default function LibraryBrowser({
  seedResources,
  initialModule = "",
  showSubmitLink = true,
}: LibraryBrowserProps) {
  const config = getFirebaseConfig();
  const db = getFirebaseDb();

  const [resources, setResources] = useState<LibraryResource[]>(seedResources);
  const [loading, setLoading] = useState(Boolean(db));
  const [source, setSource] = useState<"seed" | "firestore">("seed");
  const [filters, setFilters] = useState<LibraryFilters>({
    ...DEFAULT_LIBRARY_FILTERS,
    module: initialModule,
  });

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, LIBRARY_RESOURCES_COLLECTION),
      (snap) => {
        const list = snap.docs
          .map((d) => normalizeLibraryResource(d.data() as Record<string, unknown>, d.id))
          .filter((r): r is LibraryResource => r !== null);

        if (list.length > 0) {
          setResources(list);
          setSource("firestore");
        } else {
          setResources(seedResources);
          setSource("seed");
        }
        setLoading(false);
      },
      () => {
        setResources(seedResources);
        setSource("seed");
        setLoading(false);
      }
    );

    return unsub;
  }, [db, seedResources]);

  const filtered = useMemo(
    () => filterLibraryResources(resources, filters),
    [resources, filters]
  );

  const updateFilter = (key: keyof LibraryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 space-y-5">
        <div>
          <label htmlFor="library-search" className="sr-only">
            Search resources
          </label>
          <input
            id="library-search"
            type="search"
            placeholder="Search — e.g. robotics, coding, scholarships, free math..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-laf-border bg-laf-cream/50 text-laf-text placeholder:text-laf-muted/70 focus:outline-none focus:ring-2 focus:ring-laf-gold/50 focus:border-laf-gold"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => updateFilter("module", tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filters.module === tab.value
                  ? "bg-laf-navy text-white"
                  : "bg-laf-cream text-laf-muted hover:text-laf-navy border border-laf-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-laf-border bg-white text-sm text-laf-text focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {LIBRARY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filters.ageGroup}
            onChange={(e) => updateFilter("ageGroup", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-laf-border bg-white text-sm text-laf-text focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            aria-label="Filter by age group"
          >
            <option value="">All ages</option>
            {LIBRARY_AGE_GROUPS.map((age) => (
              <option key={age} value={age}>
                {age} years
              </option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-laf-border bg-white text-sm text-laf-text focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            aria-label="Filter by difficulty"
          >
            <option value="">All levels</option>
            {LIBRARY_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filters.cost}
            onChange={(e) => updateFilter("cost", e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-laf-border bg-white text-sm text-laf-text focus:outline-none focus:ring-2 focus:ring-laf-gold/50"
            aria-label="Filter by cost"
          >
            <option value="">All costs</option>
            {LIBRARY_COSTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-laf-muted">
        <p>
          {loading ? "Loading resources…" : (
            <>
              Showing <strong className="text-laf-navy">{filtered.length}</strong> of{" "}
              {resources.length} resources
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {!loading && source === "seed" && config && (
            <p className="text-xs text-laf-muted/80">
              Showing curated collection — import to Firestore from admin panel
            </p>
          )}
          {showSubmitLink && (
            <a
              href="/library/submit"
              className="text-sm font-medium text-laf-gold hover:underline whitespace-nowrap"
            >
              Suggest a resource →
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-laf-border bg-white h-72 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-laf-border bg-white p-12 text-center">
          <p className="text-lg font-semibold text-laf-navy">No resources match your search</p>
          <p className="mt-2 text-sm text-laf-muted">
            Try a different keyword or clear your filters.
          </p>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_LIBRARY_FILTERS)}
            className="mt-6 px-4 py-2 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-laf-cream transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
