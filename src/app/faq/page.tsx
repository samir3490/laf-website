import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import FaqAccordion from "@/components/FaqAccordion";
import faq from "@/content/faq.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQs",
  description:
    "Frequently asked questions about donating, volunteering, and supporting the Lata Agrawal Foundation.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHeader title="FAQs" subtitle="Common questions about how you can help" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_min(320px,32%)] gap-10 lg:gap-14 items-start">
          <FaqAccordion items={faq.items} />
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
