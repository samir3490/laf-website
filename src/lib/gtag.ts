/** Google Ads + GA4 helpers (client-only). */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-17149139381";

/** LAF Website GA4 property (Admin → Data streams). */
export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() ||
  process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() ||
  "G-6QNYDWN2HK";

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

export function trackGa4Event(name: string, params?: Record<string, unknown>) {
  gtag("event", name, params);
}

/** Fire a Google Ads conversion when `send_to` is configured (AW-xxx/Label). */
export function trackGoogleAdsConversion(
  sendTo: string | undefined,
  params?: Record<string, unknown>
) {
  const target = sendTo?.trim();
  if (!target) return;
  gtag("event", "conversion", { send_to: target, ...params });
}

export function trackLeadConversion(formName: "contact" | "volunteer") {
  trackGa4Event("generate_lead", {
    form_name: formName,
    page_path: formName === "contact" ? "/contact" : "/volunteer",
  });
  trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LEAD);
}

export function trackDonatePageView() {
  trackGa4Event("view_donation_page", { page_path: "/donate" });
  trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_DONATE_PAGE);
}

export function trackDonateClick() {
  trackGa4Event("begin_checkout", {
    currency: "INR",
    item_category: "donation",
    page_path: "/donate",
  });
  trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_DONATE);
}

export function trackDonateSuccess(amount?: number) {
  trackGa4Event("purchase", {
    currency: "INR",
    value: amount ?? 0,
    item_category: "donation",
    page_path: "/donate",
  });
  trackGoogleAdsConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_DONATE, {
    value: amount,
    currency: "INR",
  });
}

export function trackDrawingPageView(
  page: "gallery" | "submit",
  source?: string
) {
  const pagePath =
    page === "submit"
      ? "/events/drawing-competition/submit"
      : "/events/drawing-competition";
  trackGa4Event("view_drawing_page", {
    page_path: pagePath,
    drawing_page: page,
    ...(source ? { traffic_source: source } : {}),
  });
}

export function trackDrawingSubmit(entryId: string, source?: string) {
  trackGa4Event("drawing_submit", {
    entry_id: entryId,
    page_path: "/events/drawing-competition/submit",
    ...(source ? { traffic_source: source } : {}),
  });
}

export function trackDrawingVote(entryId: string) {
  trackGa4Event("drawing_vote", { entry_id: entryId, page_path: "/events/drawing-competition" });
}
