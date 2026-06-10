import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import { getPage, getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Lata Agrawal Foundation.",
};

export default function ContactPage() {
  const page = getPage("contact-us");
  const site = getSite();

  return (
    <>
      <PageHeader title="Contact Us" subtitle="We would love to hear from you" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div className="rounded-xl border border-laf-border bg-white p-6">
            <h2 className="font-semibold text-laf-navy">Email</h2>
            <a href={`mailto:${site.contact.email}`} className="text-laf-gold mt-2 block">
              {site.contact.email}
            </a>
          </div>
          <div className="rounded-xl border border-laf-border bg-white p-6">
            <h2 className="font-semibold text-laf-navy">Location</h2>
            <p className="mt-2 text-laf-muted">{site.contact.address}</p>
          </div>
        </div>
        {page && <WpContent html={page.html} />}
      </div>
    </>
  );
}
