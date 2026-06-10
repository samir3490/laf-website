import {
  faviconUrl,
  type LibraryResource,
} from "@/lib/library";

type ResourceCardProps = {
  resource: LibraryResource;
};

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="rounded-2xl border border-laf-border bg-white overflow-hidden flex flex-col hover:shadow-md hover:border-laf-gold/40 transition-all h-full">
      <div className="flex items-start gap-4 p-5 border-b border-laf-border/60 bg-laf-cream/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(resource.url)}
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg bg-white border border-laf-border shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-laf-navy leading-snug line-clamp-2">
            {resource.title}
          </h3>
          <p className="mt-1 text-xs text-laf-muted truncate">{resource.url}</p>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-sm text-laf-muted leading-relaxed line-clamp-3 flex-1">
          {resource.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {resource.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="text-[11px] px-2 py-0.5 rounded-full bg-laf-navy/8 text-laf-navy font-medium"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-laf-muted">
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            Ages {resource.ageGroups.join(", ")}
          </span>
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            {resource.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded bg-laf-cream border border-laf-border">
            {resource.cost}
          </span>
        </div>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
        >
          Visit Website
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
