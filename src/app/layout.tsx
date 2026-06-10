import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { getSite } from "@/lib/content";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const site = getSite();

export const metadata: Metadata = {
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
    icon: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-16 lg:pt-[4.5rem]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
