import Image from "next/image";
import Link from "next/link";

const PROMO_IMAGE = "/images/events/drawing-competition-promo.png";

const HIGHLIGHTS = [
  "Upload paintings, drawings, or digital art",
  "Ages 1–18 · four age categories",
  "Parent email verification · safe & kid-friendly",
  "Browse the gallery and vote with Google sign-in",
];

export default function DrawingCompetitionPromo() {
  return (
    <section
      className="py-14 lg:py-20 bg-gradient-to-br from-laf-cream via-white to-laf-cream/80 border-y border-laf-border"
      aria-labelledby="drawing-competition-promo-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 space-y-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-laf-gold">
              <span className="inline-block w-2 h-2 rounded-full bg-laf-gold animate-pulse" aria-hidden />
              Featured event · Submissions open
            </p>
            <h2 id="drawing-competition-promo-heading" className="text-3xl md:text-4xl font-bold text-laf-navy leading-tight">
              LAF Drawing Competition
            </h2>
            <p className="text-lg font-medium text-laf-navy/90">Theme: Education, hope, and community</p>
            <p className="text-laf-muted leading-relaxed">
              Children across India can share their creativity with the Lata Agrawal Foundation community. Upload
              your artwork in minutes — appropriate entries appear in the gallery right away. Vote for favourites in
              each age group and celebrate young artists together.
            </p>
            <ul className="space-y-2">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-laf-muted">
                  <span className="text-laf-gold font-bold shrink-0" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <Link
                href="/events/drawing-competition/submit"
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors shadow-sm"
              >
                Submit your drawing
              </Link>
              <Link
                href="/events/drawing-competition"
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg border-2 border-laf-navy text-laf-navy text-sm font-semibold hover:bg-laf-navy hover:text-white transition-colors"
              >
                View gallery &amp; vote
              </Link>
            </div>
          </div>

          <Link
            href="/events/drawing-competition/submit"
            className="order-1 lg:order-2 group block relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-xl border border-laf-border ring-1 ring-laf-gold/20 hover:ring-laf-gold/50 transition-all hover:shadow-2xl"
          >
            <Image
              src={PROMO_IMAGE}
              alt="Children's drawing competition — upload your artwork with crayons, paints, and colorful sketches"
              fill
              priority
              quality={90}
              className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-laf-navy/80 via-laf-navy/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-laf-navy/10" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">Upload your art today</p>
              <p className="mt-1 text-lg sm:text-xl font-bold drop-shadow-sm">Share your painting or drawing</p>
              <p className="mt-1 text-sm text-white/90 max-w-xs">Tap to open the submission form →</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
