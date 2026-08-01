import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import content from "@/content/how-we-help.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How We Can Help",
  description:
    "Discover how Lata Agrawal Foundation supports education, robotics, health camps, career guidance, schools, orphanages, and communities across India.",
  path: "/how-we-help",
});

export default function HowWeHelpPage() {
  return (
    <>
      <PageHeader title="How Lata Agrawal Foundation Can Help" />
      <PageContainer className="py-12 lg:py-16">
        <p className="text-lg text-laf-muted leading-relaxed max-w-3xl">{content.intro}</p>

        <nav aria-label="Service categories" className="mt-10 -mx-1 overflow-x-auto pb-2">
          <ul className="flex flex-wrap gap-2">
            {content.categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#${category.id}`}
                  className="inline-block rounded-lg border border-laf-border bg-white px-3 py-1.5 text-sm text-laf-navy hover:border-laf-gold hover:text-laf-gold transition-colors"
                >
                  {category.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#coming-soon"
                className="inline-block rounded-lg border border-dashed border-laf-gold/60 bg-laf-cream px-3 py-1.5 text-sm text-laf-navy hover:border-laf-gold hover:text-laf-gold transition-colors"
              >
                Coming Soon
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {content.categories.map((category) => (
            <section
              key={category.id}
              id={category.id}
              className="scroll-mt-28 rounded-2xl border border-laf-border bg-white p-6 md:p-7"
            >
              <h2 className="text-xl font-bold text-laf-navy">{category.title}</h2>
              <div className="w-10 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
              <ul className="space-y-2.5">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-laf-muted leading-relaxed">
                    <span className="text-laf-gold font-bold shrink-0 mt-0.5" aria-hidden>
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section
          id="referrals"
          className="scroll-mt-28 mt-12 rounded-2xl border border-laf-border bg-laf-cream/60 p-8 md:p-10"
        >
          <h2 className="text-2xl font-bold text-laf-navy">{content.referrals.title}</h2>
          <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
          <p className="text-laf-muted leading-relaxed max-w-3xl">{content.referrals.body}</p>
        </section>

        <section className="mt-10 rounded-2xl bg-laf-navy text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{content.mission.title}</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-6 rounded-full" />
          <p className="text-white/85 leading-relaxed max-w-3xl mx-auto">{content.mission.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/contact">Request Support</Button>
            <Button
              href="/ways-to-help"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-laf-navy"
            >
              Ways You Can Help
            </Button>
            <Button
              href="/donate"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-laf-navy"
            >
              Donate
            </Button>
          </div>
        </section>

        <section
          id="coming-soon"
          className="scroll-mt-28 mt-12 rounded-2xl border border-dashed border-laf-gold/50 bg-white p-8 md:p-10"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-laf-gold mb-2">
            Looking ahead
          </p>
          <h2 className="text-2xl font-bold text-laf-navy">{content.comingSoon.title}</h2>
          <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
          <p className="text-laf-muted leading-relaxed max-w-3xl mb-6">{content.comingSoon.intro}</p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {content.comingSoon.items.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm text-laf-muted leading-relaxed rounded-lg bg-laf-cream/70 px-4 py-3"
              >
                <span className="text-laf-gold font-bold shrink-0" aria-hidden>
                  ○
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-laf-muted">
            Want to help build these programs?{" "}
            <Link href="/ways-to-help" className="text-laf-gold font-medium hover:underline">
              Explore ways to support us
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="text-laf-gold font-medium hover:underline">
              get in touch
            </Link>
            .
          </p>
        </section>
      </PageContainer>
    </>
  );
}
