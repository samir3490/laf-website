import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import { ThemeShell } from "@/components/theme/ThemeShell";
import { getSite } from "@/lib/content";
import { organizationJsonLd, siteUrl } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} | Education & Community Programs`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: { canonical: siteUrl() },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

const themeFlashScript = `
try {
  var p = new URLSearchParams(location.search);
  var q = p.get('theme');
  var stored = localStorage.getItem('laf-theme');
  var theme = q === 'playful' || q === 'playful-soft' ? 'playful'
    : q === 'classic' ? 'classic'
    : (stored === 'playful-soft' || stored === 'playful' ? 'playful' : 'classic');
  if (theme === 'playful') {
    document.documentElement.dataset.theme = 'playful';
    document.documentElement.classList.add('theme-playful');
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeFlashScript }} />
      </head>
      <body className={`${jakarta.className} min-h-screen flex flex-col`}>
        <ThemeShell>
          <Navbar />
          <main className="flex-1 pt-[4.25rem] lg:pt-[5rem]">{children}</main>
          <Footer />
        </ThemeShell>
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
