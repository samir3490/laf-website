import Image from "next/image";
import Link from "next/link";
import { getGoogleBusinessConfig, reviewWriteUrl } from "@/lib/google-reviews";

type ReviewQrPanelProps = {
  qrDataUrl: string;
  reviewUrl: string;
};

export default function ReviewQrPanel({ qrDataUrl, reviewUrl }: ReviewQrPanelProps) {
  const config = getGoogleBusinessConfig();

  return (
    <aside className="rounded-2xl border border-laf-gold/30 bg-gradient-to-br from-laf-cream to-white p-6 lg:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-laf-navy">Leave us a Google review</h2>
        <p className="mt-2 text-sm text-laf-muted leading-relaxed">
          Scan the QR code or tap the button below to share your experience on our Google Business
          profile. New reviews are pulled onto this page automatically every day.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="rounded-xl border border-laf-border bg-white p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code to leave a Google review for Lata Agrawal Foundation"
            width={220}
            height={220}
            className="w-[220px] h-[220px]"
          />
        </div>
        <div className="space-y-4 text-center sm:text-left">
          <Image
            src={config.qrImage}
            alt="Printed Google review QR card"
            width={160}
            height={160}
            className="rounded-lg border border-laf-border mx-auto sm:mx-0 hidden md:block"
          />
          <Link
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-3 rounded-xl bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
          >
            Write a review on Google
          </Link>
          <p className="text-xs text-laf-muted max-w-xs">
            {config.businessName} · {config.address}
          </p>
        </div>
      </div>
    </aside>
  );
}
