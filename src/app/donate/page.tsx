import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import RazorpayDonateButton from "@/components/RazorpayDonateButton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Donate",
  description:
    "Donate to the Lata Agrawal Foundation — secure online payment, bank transfer, or UPI. Every contribution supports education and community programs.",
  path: "/donate",
});

const QR_IMAGE = "/images/2024/12/Lata-Agrawal-Foundation-QR-Code-628x1024.jpeg";

export default function DonatePage() {
  return (
    <>
      <PageHeader
        title="Donate Now"
        subtitle="Every contribution brings hope and change"
      />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="space-y-8">
            <p className="text-laf-muted leading-relaxed text-lg">
              Every donation, no matter the size, helps us take one step closer to making a
              lasting difference. Your generosity enables us to provide food, education, and
              support to those in need.
            </p>
            <div className="rounded-2xl border border-laf-border bg-white p-6 md:p-8">
              <h2 className="text-xl font-semibold text-laf-navy">Credit / Debit / Net Banking</h2>
              <p className="mt-2 text-sm text-laf-muted">
                Click the Donate button below to make a secure payment via Razorpay.
              </p>
              <div className="mt-6">
                <RazorpayDonateButton />
              </div>
            </div>
            <div className="rounded-2xl border border-laf-border bg-laf-cream/50 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-laf-navy">Bank Transfer</h2>
              <ul className="mt-4 space-y-2 text-sm text-laf-muted">
                <li><strong className="text-laf-navy">Bank:</strong> HDFC Bank</li>
                <li><strong className="text-laf-navy">Account:</strong> Lata Agrawal Foundation</li>
                <li><strong className="text-laf-navy">A/c No:</strong> 50200097041761</li>
                <li><strong className="text-laf-navy">IFSC:</strong> HDFC0000965</li>
              </ul>
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 text-center">
            <div className="rounded-2xl border border-laf-border bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-laf-navy mb-2">UPI / QR Code</h2>
              <p className="text-sm text-laf-muted mb-6">
                Scan with your preferred payment app for a quick, secure donation.
              </p>
              <div className="relative mx-auto w-64 h-[420px] rounded-xl overflow-hidden border border-laf-border bg-white">
                <Image
                  src={QR_IMAGE}
                  alt="Lata Agrawal Foundation UPI donation QR code"
                  fill
                  className="object-contain"
                  sizes="256px"
                />
              </div>
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
