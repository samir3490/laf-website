import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import HubSpotForm from "@/components/HubSpotForm";
import PageContainer from "@/components/PageContainer";
import { getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact the Lata Agrawal Foundation — Wardha, Maharashtra. Email, phone, or send a message via our form.",
  path: "/contact",
});

export default function ContactPage() {
  const site = getSite();

  return (
    <>
      <PageHeader title="Contact Us" subtitle="We would love to hear from you" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-xl border border-laf-border bg-white p-6">
            <h2 className="font-semibold text-laf-navy">Email</h2>
            <a href={`mailto:${site.contact.email}`} className="text-laf-gold mt-2 block text-sm">
              {site.contact.email}
            </a>
          </div>
          <div className="rounded-xl border border-laf-border bg-white p-6">
            <h2 className="font-semibold text-laf-navy">Phone</h2>
            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="text-laf-gold mt-2 block text-sm">
              {site.contact.phone}
            </a>
          </div>
          <div className="rounded-xl border border-laf-border bg-white p-6 md:col-span-1">
            <h2 className="font-semibold text-laf-navy">Location</h2>
            <p className="mt-2 text-laf-muted text-sm leading-relaxed">{site.contact.address}</p>
          </div>
        </div>
        <section className="rounded-2xl border border-laf-border bg-white p-6 md:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-laf-navy text-center mb-8">Get in Touch</h2>
          <HubSpotForm formKey="contact" />
        </section>
      </PageContainer>
    </>
  );
}
