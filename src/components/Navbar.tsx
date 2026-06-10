"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PageContainer from "@/components/PageContainer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/csr", label: "CSR" },
  { href: "/blog", label: "Blog" },
  { href: "/library", label: "Library" },
  { href: "/community-scratch-games", label: "Scratch Games" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-laf-border"
          : "bg-laf-navy/95 backdrop-blur-md"
      }`}
    >
      <PageContainer className="!px-4 sm:!px-6 lg:!px-10">
        <div className="flex items-center justify-between h-[4.25rem] lg:h-[5rem] gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <span className="rounded-lg bg-laf-cream px-2 py-1 shadow-sm">
              <Image
                src="/logo-square.png"
                alt="Lata Agrawal Foundation"
                width={56}
                height={56}
                className="h-11 w-11 lg:h-12 lg:w-12 object-contain"
                priority
              />
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-5 flex-1 justify-end">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  pathname === link.href
                    ? "text-laf-gold"
                    : scrolled
                      ? "text-laf-muted hover:text-laf-navy"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/donate"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-laf-gold text-white hover:bg-laf-gold-bright transition-colors whitespace-nowrap"
            >
              Donate Now
            </Link>
          </div>

          <button
            type="button"
            className={`lg:hidden p-2 ${scrolled ? "text-laf-navy" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </PageContainer>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-laf-border px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block py-2.5 text-sm font-medium ${
                pathname === link.href ? "text-laf-gold" : "text-laf-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
