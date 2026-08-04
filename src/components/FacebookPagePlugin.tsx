"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    FB?: {
      init: (params: { xfbml?: boolean; version: string }) => void;
      XFBML: { parse: (element?: HTMLElement | null) => void };
    };
    fbAsyncInit?: () => void;
  }
}

const SDK_ID = "facebook-jssdk";

function loadFacebookSdk() {
  if (typeof window === "undefined") return;
  if (document.getElementById(SDK_ID)) {
    window.FB?.XFBML.parse();
    return;
  }

  window.fbAsyncInit = function () {
    window.FB?.init({
      xfbml: true,
      version: "v21.0",
    });
  };

  const script = document.createElement("script");
  script.id = SDK_ID;
  script.async = true;
  script.defer = true;
  script.crossOrigin = "anonymous";
  script.src = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v21.0";
  document.body.appendChild(script);
}

type FacebookPagePluginProps = {
  href: string;
  height?: number;
  className?: string;
};

export default function FacebookPagePlugin({
  href,
  height = 520,
  className = "",
}: FacebookPagePluginProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFacebookSdk();

    const timer = window.setTimeout(() => {
      window.FB?.XFBML.parse(rootRef.current);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [href, height]);

  return (
    <div ref={rootRef} className={`w-full max-w-[500px] mx-auto ${className}`}>
      <div
        className="fb-page"
        data-href={href}
        data-tabs="timeline"
        data-width="500"
        data-height={String(height)}
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      >
        <blockquote cite={href} className="fb-xfbml-parse-ignore">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-laf-gold font-medium hover:underline"
          >
            View Lata Agrawal Foundation on Facebook
          </a>
        </blockquote>
      </div>
    </div>
  );
}
