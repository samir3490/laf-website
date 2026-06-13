import type { Metadata } from "next";
import { getPostFeaturedImage, getSite, stripHtml, type WpPost } from "@/lib/content";

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
  const ogImage = siteUrl("/opengraph-image");
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: getSite().name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function postMetadata(post: WpPost): Metadata {
  const description = stripHtml(post.excerpt).slice(0, 160);
  const featured = getPostFeaturedImage(post);
  const base = pageMetadata({
    title: post.title,
    description,
    path: `/blog/${post.slug}`,
  });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      images: [{ url: siteUrl(featured), width: 1200, height: 630, alt: post.title }],
    },
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  featuredImage?: string | null;
}) {
  const site = getSite();
  const image = post.featuredImage
    ? siteUrl(post.featuredImage.startsWith("/") ? post.featuredImage : `/${post.featuredImage}`)
    : siteUrl("/opengraph-image");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: stripHtml(post.excerpt).slice(0, 200),
    datePublished: post.date,
    dateModified: post.date,
    image: [image],
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: siteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
    inLanguage: "en-IN",
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
    logo: siteUrl("/logo.png"),
    image: siteUrl("/opengraph-image"),
    description: site.tagline,
    email: site.contact.email,
    telephone: site.contact.phone,
    sameAs: socialSameAs(),
    areaServed: { "@type": "Country", name: "India" },
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

export function websiteJsonLd() {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.tagline,
    inLanguage: "en-IN",
    publisher: { "@type": "NGO", name: site.name, url: site.url },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function learningResourceJsonLd(resource: {
  title: string;
  description: string;
  slug: string;
  externalUrl?: string;
}) {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description.slice(0, 300),
    url: siteUrl(`/library/${resource.slug}`),
    learningResourceType: "Reference material",
    isAccessibleForFree: true,
    inLanguage: "en-IN",
    provider: { "@type": "NGO", name: site.name, url: site.url },
    ...(resource.externalUrl ? { sameAs: resource.externalUrl } : {}),
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
