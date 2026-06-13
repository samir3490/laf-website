import Image from "next/image";
import Link from "next/link";
import {
  DRAWING_COMPETITION_DATES,
  DRAWING_COMPETITION_PROMO_ALT,
  DRAWING_COMPETITION_PROMO_IMAGE,
  DRAWING_COMPETITION_THEME,
} from "@/lib/drawing-competition-promo";

type DrawingCompetitionBannerProps = {
  variant?: "submit" | "gallery";
};

export default function DrawingCompetitionBanner({ variant = "submit" }: DrawingCompetitionBannerProps) {
  const isSubmit = variant === "submit";

  return (
    <div className="rounded-2xl border border-laf-border bg-white overflow-hidden shadow-sm mb-8">
      <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-56 sm:max-h-64 w-full">
        <Image
          src={DRAWING_COMPETITION_PROMO_IMAGE}
          alt={DRAWING_COMPETITION_PROMO_ALT}
          fill
          priority={isSubmit}
          quality={90}
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 720px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-laf-navy/85 via-laf-navy/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-5 sm:p-8 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-laf-gold">
            {DRAWING_COMPETITION_DATES.label}
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white leading-tight">
            {isSubmit ? "Submit your artwork" : "LAF Drawing Competition"}
          </h2>
          <p className="mt-2 text-sm text-white/90 hidden sm:block">
            Theme: {DRAWING_COMPETITION_THEME}
          </p>
        </div>
      </div>
      <div className="px-5 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-laf-cream/40">
        <p className="text-sm text-laf-muted">
          {isSubmit ? (
            <>
              Open <strong className="text-laf-navy">{DRAWING_COMPETITION_DATES.labelShort}</strong>. Upload
              paintings, drawings, or digital art (ages 1–18).
            </>
          ) : (
            <>
              Event runs <strong className="text-laf-navy">{DRAWING_COMPETITION_DATES.label}</strong>. Browse entries
              and vote for your favourites.
            </>
          )}
        </p>
        {!isSubmit && (
          <Link
            href="/events/drawing-competition/submit"
            className="shrink-0 text-center px-4 py-2 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
          >
            Submit artwork
          </Link>
        )}
      </div>
    </div>
  );
}
