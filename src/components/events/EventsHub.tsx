import Image from "next/image";
import Link from "next/link";
import { EVENT_COMPETITIONS } from "@/lib/events";
import { DRAWING_COMPETITION_PROMO_ALT } from "@/lib/drawing-competition-promo";

export default function EventsHub() {
  return (
    <div className="space-y-8">
      <p className="text-laf-muted leading-relaxed max-w-3xl">
        Join LAF events and competitions for children and learners across India. Submit your work,
        explore what others have created, and celebrate creativity together.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {EVENT_COMPETITIONS.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-laf-border bg-white overflow-hidden shadow-sm flex flex-col"
          >
            {event.image && (
              <Link href={event.href} className="group block relative aspect-[16/10] w-full shrink-0">
                <Image
                  src={event.image}
                  alt={DRAWING_COMPETITION_PROMO_ALT}
                  fill
                  quality={85}
                  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-laf-navy/70 via-transparent to-transparent" />
                {event.dateRange && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">{event.dateRange}</p>
                    <p className="text-lg font-bold text-white">{event.title}</p>
                  </div>
                )}
              </Link>
            )}
            <div className="p-6 lg:p-8 flex flex-col flex-1">
              {!event.image && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">{event.subtitle}</p>
                  <h2 className="mt-2 text-xl font-bold text-laf-navy">{event.title}</h2>
                </>
              )}
              {event.image && (
                <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">{event.subtitle}</p>
              )}
              <p className="mt-3 text-sm text-laf-muted leading-relaxed flex-1">{event.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={event.href}
                  className="px-5 py-2.5 rounded-lg bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
                >
                  {event.cta}
                </Link>
                {event.submitHref && (
                  <Link
                    href={event.submitHref}
                    className="px-5 py-2.5 rounded-lg border border-laf-border text-sm font-medium text-laf-navy hover:bg-laf-cream/60 transition-colors"
                  >
                    Submit entry
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-laf-muted">
        More competitions will be added here. Check back soon or follow us on social media for updates.
      </p>
    </div>
  );
}
