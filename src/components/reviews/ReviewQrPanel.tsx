import Image from "next/image";
import Link from "next/link";
import { getGoogleBusinessConfig } from "@/lib/google-reviews";

type ReviewQrPanelProps = {
  reviewUrl: string;
};

export default function ReviewQrPanel({ reviewUrl }: ReviewQrPanelProps) {
  const config = getGoogleBusinessConfig();

  return (
    <aside className="rounded-2xl border border-laf-gold/30 bg-gradient-to-br from-laf-cream to-white p-6 lg:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-laf-navy">Leave us a Google review</h2>
        <p className="mt-2 text-sm text-laf-muted leading-relaxed">
          Scan the QR code or tap the button below to share your experience on our Google Business
          profile.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="rounded-xl border border-laf-border bg-white p-3 shadow-sm">
          <Image
            src={config.qrImage}
            alt="QR code to leave a Google review for Lata Agrawal Foundation"
            width={220}
            height={220}
            className="w-[220px] h-[220px] object-contain"
          />
        </div>
        <Link
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex px-5 py-3 rounded-xl bg-laf-gold text-white text-sm font-semibold hover:bg-laf-gold-bright transition-colors"
        >
          Write a review on Google
        </Link>
      </div>
    </aside>
  );
}
