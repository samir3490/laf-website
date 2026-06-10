"use client";

import { useEffect, useRef } from "react";
import { getSite } from "@/lib/content";

export default function RazorpayDonateButton() {
  const formRef = useRef<HTMLFormElement>(null);
  const buttonId = getSite().razorpayPaymentButtonId;

  useEffect(() => {
    if (!formRef.current || !buttonId) return;
    const existing = formRef.current.querySelector("script");
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.dataset.payment_button_id = buttonId;
    script.async = true;
    formRef.current.appendChild(script);
  }, [buttonId]);

  return <form ref={formRef} className="razorpay-donate-form" />;
}
