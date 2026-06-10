import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import csr from "@/content/csr.json";
import site from "@/content/site.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "CSR for Companies",
  description:
    "Partner with Lata Agrawal Foundation for corporate social responsibility programs in education, healthcare, and community development.",
  path: "/csr",
});

export default function CsrPage() {
  return (
    <>
      <PageHeader
        title="CSR for Companies"
        subtitle="Partner with us to create lasting community impact"
      />
      <PageContainer className="py-12 lg:py-16">
        <p className="text-lg text-laf-muted leading-relaxed max-w-3xl mb-12">{csr.intro}</p>

        <div className="grid lg:grid-cols-2 gap-8 mb-14">
          <section className="rounded-2xl border border-laf-border bg-white p-8">
            <h2 className="text-2xl font-bold text-laf-navy">Why Partner With Us</h2>
            <div className="w-12 h-1 bg-laf-gold mt-3 mb-6 rounded-full" />
            <ul className="space-y-3">
              {csr.whyPartner.map((item) => (
                <li key={item} className="flex gap-3 text-laf-muted text-sm leading-relaxed">
                  <span className="text-laf-gold font-bold shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-laf-border bg-laf-cream/50 p-8">
            <h2 className="text-2xl font-bold text-laf-navy">CSR Programs We Can Run Together</h2>
            <div className="w-12 h-1 bg-laf-gold mt-3 mb-6 rounded-full" />
            <ul className="space-y-4">
              {csr.programs.map((program) => (
                <li key={program.title}>
                  <h3 className="font-semibold text-laf-navy">{program.title}</h3>
                  <p className="mt-1 text-sm text-laf-muted">{program.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-laf-navy text-center">How We Work</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-10 rounded-full" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {csr.process.map((item, i) => (
              <li
                key={item.step}
                className="rounded-2xl border border-laf-border bg-white p-6 text-center"
              >
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-laf-gold text-white text-sm font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-laf-navy">{item.step}</h3>
                <p className="mt-2 text-sm text-laf-muted leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-laf-navy text-white p-8 md:p-10 text-center">
          <h2 className="text-xl font-bold">Contact for CSR Partnerships</h2>
          <p className="mt-4 text-white/85 text-sm">
            Email{" "}
            <a href={`mailto:${site.contact.email}`} className="text-laf-gold hover:underline">
              {site.contact.email}
            </a>
            {" · "}
            Phone{" "}
            <a href="tel:+919421095604" className="text-laf-gold hover:underline">
              {site.contact.phone}
            </a>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
            >
              Partner With Us
            </Link>
            <Link
              href="/donate"
              className="px-6 py-2.5 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Donate
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
