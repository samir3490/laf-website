import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import Button from "@/components/Button";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "CSR for Companies",
  description: "Partner with Lata Agrawal Foundation for corporate social responsibility programs.",
};

export default function CsrPage() {
  const page = getPage("csr-companies");

  return (
    <>
      <PageHeader
        title="CSR for Companies"
        subtitle="Partner with us to create lasting community impact"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page ? (
          <WpContent html={page.html} />
        ) : (
          <p className="text-laf-muted leading-relaxed">
            Companies can partner with the Lata Agrawal Foundation to support education,
            healthcare, and community programs across India. Contact us to discuss CSR
            initiatives tailored to your organization.
          </p>
        )}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button href="/contact">Partner With Us</Button>
          <Button href="/donate" variant="outline">Donate</Button>
        </div>
      </div>
    </>
  );
}
