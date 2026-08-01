import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import FaqAccordion, { flattenFaqItems } from "@/components/FaqAccordion";
import faq from "@/content/faq.json";
import JsonLd from "@/components/JsonLd";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQs",
  description:
    "Frequently asked questions about Lata Agrawal Foundation — donations, volunteering, CSR partnerships, schools, orphanages, and how to get involved.",
  path: "/faq",
});

export default function FaqPage() {
  const jsonLdItems = flattenFaqItems(faq.categories);

  return (
    <>
      <JsonLd data={faqPageJsonLd(jsonLdItems)} />
      <PageHeader title="Frequently Asked Questions" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_min(320px,32%)] gap-10 lg:gap-14 items-start">
          <div className="space-y-12">
            <nav aria-label="FAQ categories" className="-mx-1 overflow-x-auto pb-1">
              <ul className="flex flex-wrap gap-2">
                {faq.categories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={`#${category.id}`}
                      className="inline-block rounded-lg border border-laf-border bg-white px-3 py-1.5 text-sm text-laf-navy hover:border-laf-gold hover:text-laf-gold transition-colors"
                    >
                      {category.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {faq.categories.map((category, categoryIndex) => (
              <section key={category.id} id={category.id} className="scroll-mt-28">
                <h2 className="text-xl md:text-2xl font-bold text-laf-navy mb-2">
                  {category.title}
                </h2>
                <div className="w-10 h-1 bg-laf-gold mb-5 rounded-full" />
                <FaqAccordion items={category.items} openFirst={categoryIndex === 0} />
              </section>
            ))}

            <section className="rounded-2xl bg-laf-navy text-white p-8 md:p-10 text-center">
              <p className="text-white/90 leading-relaxed max-w-2xl mx-auto">{faq.closing}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/ways-to-help" className="text-laf-gold font-medium hover:underline">
                  Ways to Help
                </Link>
                <Link href="/donate" className="text-laf-gold font-medium hover:underline">
                  Donate
                </Link>
                <Link href="/volunteer" className="text-laf-gold font-medium hover:underline">
                  Volunteer
                </Link>
                <Link href="/contact" className="text-laf-gold font-medium hover:underline">
                  Contact
                </Link>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-laf-border shadow-sm">
              <Image
                src={faq.image}
                alt="Thinking about how to help"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 80vw, 320px"
              />
            </div>
            <p className="text-sm text-laf-muted text-center">
              Still have questions?{" "}
              <Link href="/contact" className="text-laf-gold font-medium hover:underline">
                Contact us
              </Link>
            </p>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
