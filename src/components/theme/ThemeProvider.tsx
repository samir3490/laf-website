"use client";

import { PlayfulBackdrop } from "@/components/theme/PlayfulBackdrop";
import { ThemePreviewBar } from "@/components/theme/ThemePreviewBar";
import {
  THEME_PREVIEW_KEY,
  THEME_STORAGE_KEY,
  parseThemeParam,
  type SiteTheme,
} from "@/lib/theme";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function readStoredTheme(): SiteTheme {
  if (typeof window === "undefined") return "classic";
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "playful" ? "playful" : "classic";
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("theme-playful", theme === "playful");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [theme, setTheme] = useState<SiteTheme>("classic");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const paramTheme = parseThemeParam(searchParams.get("theme"));
    const stored = readStoredTheme();
    const nextTheme = paramTheme ?? stored;

    applyTheme(nextTheme);
    setTheme(nextTheme);

    if (nextTheme === "playful") {
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
    }

    setReady(true);
  }, [searchParams, pathname]);

  const setSiteTheme = (next: SiteTheme) => {
    if (next === "classic") {
      localStorage.setItem(THEME_STORAGE_KEY, "classic");
      sessionStorage.removeItem(THEME_PREVIEW_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, "playful");
      sessionStorage.setItem(THEME_PREVIEW_KEY, "1");
    }
    applyTheme(next);
    setTheme(next);

    const url = new URL(window.location.href);
    if (next === "classic") {
      url.searchParams.delete("theme");
    } else {
      url.searchParams.set("theme", "playful");
    }
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  };

  return (
    <>
      {ready && theme === "playful" && <PlayfulBackdrop />}
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
      {ready && (
        <ThemePreviewBar theme={theme} onThemeChange={setSiteTheme} pathname={pathname} />
      )}
    </>
  );
}
