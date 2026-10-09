import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import Button from "@/components/Button";
import { pageMetadata } from "@/lib/seo";
import {
  YOUNG_INNOVATORS_DATES,
  YOUNG_INNOVATORS_PROMO_ALT,
  YOUNG_INNOVATORS_PROMO_IMAGE,
} from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Young Innovators Challenge 2026",
  description:
    "Free online challenge for ages 6–16: create something useful from home materials, upload 2 photos and a 1-minute video. Digital certificates from Lata Agrawal Foundation.",
  path: "/events/young-innovators",
});

const EXAMPLES = [
  "A bird feeder from a waste bottle",
  "A working water filter model",
  "A useful invention from cardboard",
  "A simple science experiment",
  "A model of an eco-friendly house",
];

export default function YoungInnovatorsPage() {
  return (
    <>
      <PageHeader title="Young Innovators Challenge 2026" />
      <PageContainer className="py-12 lg:py-16 space-y-12">
        <EventBackLink />

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-laf-gold">
              {YOUNG_INNOVATORS_DATES.label} · Free · Online · From home
            </p>
            <p className="text-lg text-laf-muted leading-relaxed">
              Children aged <strong className="text-laf-navy">6–16</strong> create something useful
              using materials available at home, then share photos and a short explanation video with
              the Lata Agrawal Foundation community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/events/young-innovators/submit">Submit your project</Button>
              <Button href="/library" variant="outline">
                Free learning library
              </Button>
            </div>
          </div>
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-laf-border shadow-md">
            <Image
              src={YOUNG_INNOVATORS_PROMO_IMAGE}
              alt={YOUNG_INNOVATORS_PROMO_ALT}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-laf-navy">The challenge</h2>
          <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
          <p className="text-laf-muted leading-relaxed max-w-3xl">
            Create something useful using materials available at home. Be creative, safe, and
            practical — recycling and science experiments are welcome.
          </p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3">
            {EXAMPLES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-laf-border bg-white px-4 py-3 text-sm text-laf-muted flex gap-2"
              >
                <span className="text-laf-gold font-bold" aria-hidden>
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-laf-border bg-white p-6">
            <h3 className="font-semibold text-laf-navy">How to participate</h3>
            <ol className="mt-4 space-y-2 text-sm text-laf-muted list-decimal list-inside leading-relaxed">
              <li>Build the project at home with a parent</li>
              <li>Take 2 clear photos</li>
              <li>Record a ~1-minute video and upload it to YouTube or Google Drive</li>
              <li>
                <Link href="/events/young-innovators/submit" className="text-laf-gold hover:underline">
                  Submit on this website
                </Link>{" "}
                — paste the video link; no account or email code needed
              </li>
            </ol>
          </div>
          <div className="rounded-2xl border border-laf-border bg-white p-6">
            <h3 className="font-semibold text-laf-navy">Recognition</h3>
            <ul className="mt-4 space-y-2 text-sm text-laf-muted leading-relaxed">
              <li>Digital participation certificates for valid entries</li>
              <li>Special certificates for the most creative projects</li>
              <li>Certificates emailed to the parent address after review</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-laf-border bg-laf-cream/50 p-6">
            <h3 className="font-semibold text-laf-navy">Why this matters</h3>
            <p className="mt-4 text-sm text-laf-muted leading-relaxed">
              Hands-on making builds problem-solving, digital sharing skills, and confidence —
              especially for children who learn best by doing. LAF celebrates young innovators across
              India.
            </p>
          </div>
        </section>

        <div className="rounded-2xl bg-laf-navy text-white p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to invent?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm leading-relaxed">
            Open {YOUNG_INNOVATORS_DATES.label}. Free for ages 6–16. Parents can submit in a few
            minutes from a phone.
          </p>
          <div className="mt-6">
            <Link
              href="/events/young-innovators/submit"
              className="inline-flex px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
            >
              Open submission form
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
