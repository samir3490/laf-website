"use client";

import { useEffect, useRef } from "react";
import { getSite } from "@/lib/content";
import { trackLeadConversion } from "@/lib/gtag";

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (opts: {
          portalId: string;
          formId: string;
          region: string;
          target: string;
          onFormSubmitted?: () => void;
        }) => void;
      };
    };
  }
}

const SCRIPT_SRC = "//js.hsforms.net/forms/embed/v2.js";

type HubSpotFormProps = {
  formKey: "volunteer" | "contact";
  id?: string;
};

export default function HubSpotForm({
  formKey,
  id = `hs-${formKey}`,
}: HubSpotFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const createdRef = useRef(false);
  const { portalId, region, forms } = getSite().hubspot;
  const formId = forms[formKey];

  useEffect(() => {
    if (createdRef.current || !formId) return;

    const createForm = () => {
      if (!window.hbspt || !containerRef.current) return;
      createdRef.current = true;
      window.hbspt.forms.create({
        portalId,
        formId,
        region,
        target: `#${id}`,
        onFormSubmitted: () => {
          trackLeadConversion(formKey);
        },
      });
    };

    if (window.hbspt) {
      createForm();
      return;
    }

    const existing = document.querySelector(
      `script[src="${SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", createForm);
      return () => existing.removeEventListener("load", createForm);
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.charset = "utf-8";
    script.async = true;
    script.onload = createForm;
    document.head.appendChild(script);
  }, [id, formId, portalId, region]);

  return (
    <div
      id={id}
      ref={containerRef}
      className="hubspot-form-wrapper min-h-[200px]"
    />
  );
}
