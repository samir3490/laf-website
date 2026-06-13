import Link from "next/link";
import { EVENT_COMPETITIONS } from "@/lib/events";

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
            className="rounded-2xl border border-laf-border bg-white p-6 lg:p-8 shadow-sm flex flex-col"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold">{event.subtitle}</p>
            <h2 className="mt-2 text-xl font-bold text-laf-navy">{event.title}</h2>
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
          </article>
        ))}
      </div>

      <p className="text-xs text-laf-muted">
        More competitions will be added here. Check back soon or follow us on social media for updates.
      </p>
    </div>
  );
}
