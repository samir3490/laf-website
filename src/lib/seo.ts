import type { Metadata } from "next";
import { getSite, stripHtml } from "@/lib/content";

export function siteUrl(path = ""): string {
  const base = getSite().url.replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = siteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: getSite().name,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
}) {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: stripHtml(post.excerpt).slice(0, 200),
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
  };
}

function socialSameAs() {
  return Object.values(getSite().social).filter(Boolean);
}

export function organizationJsonLd() {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: site.name,
    url: site.url,
    description: site.tagline,
    email: site.contact.email,
    telephone: site.contact.phone,
    sameAs: socialSameAs(),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.contact.address,
      addressLocality: "Wardha",
      addressRegion: "Maharashtra",
      postalCode: "442001",
      addressCountry: "IN",
    },
  };
}

export function contactPageJsonLd() {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${site.name}`,
    url: siteUrl("/contact"),
    mainEntity: {
      "@type": "NGO",
      name: site.name,
      email: site.contact.email,
      telephone: site.contact.phone,
      url: site.url,
      sameAs: socialSameAs(),
      address: {
        "@type": "PostalAddress",
        streetAddress: site.contact.address,
        addressLocality: "Wardha",
        addressRegion: "Maharashtra",
        postalCode: "442001",
        addressCountry: "IN",
      },
    },
  };
}
