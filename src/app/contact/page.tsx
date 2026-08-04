import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import HubSpotForm from "@/components/HubSpotForm";
import PageContainer from "@/components/PageContainer";
import SocialLinks from "@/components/SocialLinks";
import FacebookPagePlugin from "@/components/FacebookPagePlugin";
import JsonLd from "@/components/JsonLd";
import { getSite } from "@/lib/content";
import { contactPageJsonLd, pageMetadata } from "@/lib/seo";

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
      <JsonLd data={contactPageJsonLd()} />
      <PageHeader title="Contact Us" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-laf-navy">Get in Touch</h2>
              <p className="mt-4 text-laf-muted leading-relaxed">
                Whether you have questions about our programs, want to partner with us, or
                are interested in volunteering — we&apos;d love to hear from you.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-laf-border bg-white p-6">
                <h3 className="font-semibold text-laf-navy">Email</h3>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="text-laf-gold mt-2 block text-sm hover:underline"
                >
                  {site.contact.email}
                </a>
              </div>
              <div className="rounded-xl border border-laf-border bg-white p-6">
                <h3 className="font-semibold text-laf-navy">Phone</h3>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="text-laf-gold mt-2 block text-sm hover:underline"
                >
                  {site.contact.phone}
                </a>
              </div>
              <div className="rounded-xl border border-laf-border bg-laf-cream/50 p-6">
                <h3 className="font-semibold text-laf-navy">Visit Us</h3>
                <p className="mt-2 text-sm text-laf-muted leading-relaxed">
                  {site.contact.address}
                </p>
                {"googleBusiness" in site.social && site.social.googleBusiness && (
                  <a
                    href={site.social.googleBusiness}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-medium text-laf-gold hover:underline"
                  >
                    View on Google Maps / Google Business
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-laf-navy mb-4">Follow Us</h3>
              <SocialLinks variant="light" />
            </div>

            {site.social.facebook && (
              <div>
                <h3 className="font-semibold text-laf-navy mb-4">Facebook Updates</h3>
                <div className="rounded-2xl border border-laf-border bg-white p-3 overflow-hidden">
                  <FacebookPagePlugin href={site.social.facebook} height={420} />
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-laf-border bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-laf-navy mb-2">Send a Message</h2>
              <p className="text-sm text-laf-muted mb-6">
                Fill out the form and our team will get back to you as soon as possible.
              </p>
              <HubSpotForm formKey="contact" />
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
