import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import { getSite } from "@/lib/content";
import { organizationJsonLd, rssAlternateTypes, siteUrl } from "@/lib/seo";

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
    images: [{ url: siteUrl("/opengraph-image"), width: 1200, height: 630, alt: site.name }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: siteUrl(),
    types: rssAlternateTypes(),
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className={`${jakarta.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-[4.25rem] lg:pt-[5rem]">{children}</main>
        <Footer />
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
