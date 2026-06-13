import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import ways from "@/content/ways-to-help.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ways to Help",
  description:
    "Donate, volunteer, or spread the word — discover how you can support the Lata Agrawal Foundation.",
  path: "/ways-to-help",
});

export default function WaysToHelpPage() {
  return (
    <>
      <PageHeader title="Ways to Help" />
      <PageContainer className="py-12 lg:py-16 space-y-16">
        {ways.ways.map((way, i) => (
          <section
            key={way.title}
            className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
              i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-laf-border shadow-sm">
              <Image
                src={way.image}
                alt={way.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-laf-navy">{way.title}</h2>
              <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
              <p className="text-laf-muted leading-relaxed">{way.description}</p>
              <Link
                href={way.href}
                className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
              >
                {way.cta}
              </Link>
            </div>
          </section>
        ))}
      </PageContainer>
    </>
  );
}
