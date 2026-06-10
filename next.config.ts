import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
        pathname: "/images.unsplash.com/**",
      },
    ],
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
    ];
    return redirects;
  },
};

export default nextConfig;
