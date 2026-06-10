import Script from "next/script";
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/gtag";

export default function Analytics() {
  const primaryId = GA4_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          ${GA4_MEASUREMENT_ID ? `gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true, anonymize_ip: true });` : ""}
          gtag('config', '${GOOGLE_ADS_ID}', {
            allow_enhanced_conversions: true
          });
        `}
      </Script>
    </>
  );
}
