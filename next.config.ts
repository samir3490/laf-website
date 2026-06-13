import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
        pathname: "/images.unsplash.com/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async redirects() {
    const redirects = [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/donate-now", destination: "/donate", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/become-a-volunteer", destination: "/volunteer", permanent: true },
      { source: "/news-2", destination: "/blog", permanent: true },
      { source: "/faqs", destination: "/faq", permanent: true },
      { source: "/service-we-provide", destination: "/ways-to-help", permanent: true },
      { source: "/home-2", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/csr-companies", destination: "/csr", permanent: true },
      { source: "/volunteers", destination: "/volunteer", permanent: true },
      { source: "/mission", destination: "/about", permanent: true },
      { source: "/our-causes", destination: "/ways-to-help", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/category/:path*", destination: "/blog", permanent: true },
      { source: "/tag/:path*", destination: "/blog", permanent: true },
      { source: "/author/:path*", destination: "/blog", permanent: true },
      { source: "/drawing-competition", destination: "/events/drawing-competition", permanent: true },
      { source: "/drawing-competition/submit", destination: "/events/drawing-competition/submit", permanent: true },
      { source: "/community-scratch-games", destination: "/events/scratch-games", permanent: true },
    ];
    return redirects;
  },
};

export default nextConfig;
