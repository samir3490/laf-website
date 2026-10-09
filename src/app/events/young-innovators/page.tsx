import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import EventBackLink from "@/components/events/EventBackLink";
import Button from "@/components/Button";
import YoungInnovatorsPageTracker from "@/components/innovators/YoungInnovatorsPageTracker";
import { pageMetadata } from "@/lib/seo";
import {
  YOUNG_INNOVATORS_DATES,
  YOUNG_INNOVATORS_PROMO_ALT,
  YOUNG_INNOVATORS_PROMO_IMAGE,
} from "@/lib/young-innovators";

export const metadata: Metadata = pageMetadata({
  title: "Young Innovators Challenge 2026",
  description:
    "Free online challenge for ages 6–16: create something useful from home materials, verify email, upload 2 photos and a 1-minute video. Browse the gallery and vote with Google.",
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
      <YoungInnovatorsPageTracker page="home" />
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
              <Button href="/events/young-innovators/gallery" variant="outline">
                Gallery &amp; vote
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
              <li>Build the project at home with guidance</li>
              <li>Take at least one clear photo (second photo and video are optional)</li>
              <li>
                <Link href="/events/young-innovators/submit" className="text-laf-gold hover:underline">
                  Verify your email
                </Link>{" "}
                with a one-time code, then submit
              </li>
              <li>LAF reviews — approved projects appear in the gallery</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-laf-border bg-white p-6">
            <h3 className="font-semibold text-laf-navy">Gallery &amp; voting</h3>
            <ul className="mt-4 space-y-2 text-sm text-laf-muted leading-relaxed">
              <li>Anyone can browse approved projects</li>
              <li>Sign in with Google to vote (one vote per project)</li>
              <li>Age groups: 6–10 and 11–16</li>
              <li>
                <Link href="/events/young-innovators/gallery" className="text-laf-gold hover:underline">
                  Open gallery
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-laf-border bg-laf-cream/50 p-6">
            <h3 className="font-semibold text-laf-navy">Recognition</h3>
            <ul className="mt-4 space-y-2 text-sm text-laf-muted leading-relaxed">
              <li>Digital certificates for valid entries (emailed after review)</li>
              <li>Special certificates for the most creative projects</li>
              <li>Your email and phone are never shown on the gallery</li>
            </ul>
          </div>
        </section>

        <div className="rounded-2xl bg-laf-navy text-white p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to invent?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm leading-relaxed">
            Open {YOUNG_INNOVATORS_DATES.label}. Free for ages 6–16. Verify email, submit from a
            phone, then explore the gallery.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/events/young-innovators/submit"
              className="inline-flex px-6 py-3 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
            >
              Open submission form
            </Link>
            <Link
              href="/events/young-innovators/gallery"
              className="inline-flex px-6 py-3 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              View gallery
            </Link>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
