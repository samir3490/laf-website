"use client";

import { useEffect } from "react";
import { trackDonateClick, trackDonatePageView, trackDonateSuccess } from "@/lib/gtag";

/** Tracks donate page views and Razorpay payment button interactions. */
export default function DonateAnalytics() {
  useEffect(() => {
    trackDonatePageView();

    function onMessage(event: MessageEvent) {
      const origin = typeof event.origin === "string" ? event.origin : "";
      if (!origin.includes("razorpay.com")) return;

      const data = event.data;
      if (typeof data === "string") {
        if (/success|payment\.success|payment_success/i.test(data)) {
          trackDonateSuccess();
        }
        return;
      }

      if (data && typeof data === "object") {
        const payload = data as Record<string, unknown>;
        const eventName = String(payload.event ?? payload.type ?? "");
        if (/success|payment\.success|payment_success/i.test(eventName)) {
          const amount =
            typeof payload.amount === "number"
              ? payload.amount / 100
              : undefined;
          trackDonateSuccess(amount);
        }
      }
    }

    window.addEventListener("message", onMessage);

    const form = document.querySelector(".razorpay-donate-form");
    const onClick = () => trackDonateClick();
    form?.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("message", onMessage);
      form?.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
