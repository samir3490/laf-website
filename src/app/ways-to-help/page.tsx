import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import ways from "@/content/ways-to-help.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Ways You Can Support",
  description:
    "Support Lata Agrawal Foundation with donations, technology, books, volunteering, CSR partnerships, and more — contribute in ways that match your skills, time, or resources.",
  path: "/ways-to-help",
});

export default function WaysToHelpPage() {
  return (
    <>
      <PageHeader title="Ways You Can Support Lata Agrawal Foundation" />
      <PageContainer className="py-12 lg:py-16">
        <p className="text-lg text-laf-muted leading-relaxed max-w-3xl">{ways.intro}</p>

        <nav
          aria-label="Ways to help categories"
          className="mt-10 -mx-1 overflow-x-auto pb-2"
        >
          <ul className="flex flex-wrap gap-2">
            {ways.categories.map((category) => (
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

        <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {ways.categories.map((category) => (
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

        <section className="mt-16 rounded-2xl bg-laf-navy text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{ways.closing.title}</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-6 rounded-full" />
          <p className="text-white/85 leading-relaxed max-w-3xl mx-auto">{ways.closing.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/donate">Donate Now</Button>
            <Button
              href="/volunteer"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-laf-navy"
            >
              Volunteer
            </Button>
            <Button
              href="/csr"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-laf-navy"
            >
              CSR Partnership
            </Button>
            <Button
              href="/contact"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-laf-navy"
            >
              Contact Us
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/70">
            Prefer online giving? Visit our{" "}
            <Link href="/donate" className="text-laf-gold hover:underline font-medium">
              donate page
            </Link>{" "}
            for Razorpay, bank transfer, or UPI.
          </p>
        </section>
      </PageContainer>
    </>
  );
}
