"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import { getSite } from "@/lib/content";

type NavChild = { href: string; label: string };
type NavItem =
  | { type: "link"; href: string; label: string }
  | { type: "group"; label: string; children: NavChild[] };

const navItems: NavItem[] = [
  { type: "link", href: "/", label: "Home" },
  {
    type: "group",
    label: "About",
    children: [
      { href: "/about", label: "About Us" },
      { href: "/how-we-help", label: "How We Help" },
      { href: "/gallery", label: "Gallery" },
      { href: "/reviews", label: "Reviews" },
      { href: "/faq", label: "FAQs" },
    ],
  },
  {
    type: "group",
    label: "Get Involved",
    children: [
      { href: "/donate", label: "Donate" },
      { href: "/ways-to-help", label: "Ways to Help" },
      { href: "/volunteer", label: "Volunteer" },
      { href: "/csr", label: "CSR Partnerships" },
    ],
  },
  {
    type: "group",
    label: "Learn",
    children: [
      { href: "/library", label: "Learning Library" },
      { href: "/blog", label: "Blog" },
      { href: "/events", label: "Events" },
    ],
  },
  { type: "link", href: "/contact", label: "Contact" },
];

function pathMatches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/events") return pathname === "/events" || pathname.startsWith("/events/");
  if (href === "/library") return pathname === "/library" || pathname.startsWith("/library/");
  if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, children: NavChild[]): boolean {
  return children.some((child) => pathMatches(pathname, child.href));
}

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopGroup, setOpenDesktopGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const portalUrl = getSite().portalUrl;
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDesktopGroup(null);
    setOpenMobileGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!openDesktopGroup) return;
    const onPointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDesktopGroup(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDesktopGroup(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDesktopGroup]);

  const linkClass = (active: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? "text-laf-gold"
        : scrolled
          ? "text-laf-muted hover:text-laf-navy"
          : "text-white/90 hover:text-white"
    }`;

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-laf-border"
          : "bg-laf-navy/95 backdrop-blur-md"
      }`}
    >
      <PageContainer className="!px-4 sm:!px-6 lg:!px-10">
        <div className="flex items-center justify-between h-[4.25rem] lg:h-[5rem] gap-4">
          <Link href="/" className="flex items-center shrink-0 min-w-0">
            <span className="rounded-lg bg-laf-cream px-2.5 py-1.5 shadow-sm">
              <Image
                src="/logo.png"
                alt="Lata Agrawal Foundation"
                width={320}
                height={80}
                className="h-10 sm:h-11 lg:h-14 w-auto max-w-[200px] sm:max-w-[240px] lg:max-w-[300px] object-contain"
                priority
              />
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-end">
            {navItems.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-2 ${linkClass(pathMatches(pathname, item.href))}`}
                  >
                    {item.label}
                  </Link>
                );
              }

              const active = isGroupActive(pathname, item.children);
              const open = openDesktopGroup === item.label;

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDesktopGroup(item.label)}
                  onMouseLeave={() => setOpenDesktopGroup(null)}
                >
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 px-2.5 py-2 ${linkClass(active || open)}`}
                    aria-expanded={open}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDesktopGroup((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <Chevron open={open} />
                  </button>
                  {open && (
                    <div className="absolute top-full left-0 pt-1 min-w-[12.5rem]">
                      <div className="rounded-xl border border-laf-border bg-white shadow-lg py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              pathMatches(pathname, child.href)
                                ? "text-laf-gold bg-laf-cream/60 font-medium"
                                : "text-laf-navy hover:bg-laf-cream/50"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`ml-1 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors whitespace-nowrap ${
                  scrolled
                    ? "border-laf-navy text-laf-navy hover:bg-laf-navy hover:text-white"
                    : "border-white/80 text-white hover:bg-white hover:text-laf-navy"
                }`}
              >
                Portal
              </a>
            )}
            <Link
              href="/donate"
              className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold bg-laf-gold text-white hover:bg-laf-gold-bright transition-colors whitespace-nowrap"
            >
              Donate Now
            </Link>
          </div>

          <button
            type="button"
            className={`lg:hidden p-2 ${scrolled ? "text-laf-navy" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
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
        <div className="lg:hidden bg-white border-t border-laf-border px-4 py-4 max-h-[min(70vh,32rem)] overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block py-2.5 text-sm font-medium ${
                      pathMatches(pathname, item.href) ? "text-laf-gold" : "text-laf-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              const open = openMobileGroup === item.label;
              const active = isGroupActive(pathname, item.children);

              return (
                <div key={item.label} className="border-b border-laf-border/60 last:border-0 pb-1 mb-1">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between py-2.5 text-sm font-medium ${
                      active ? "text-laf-gold" : "text-laf-navy"
                    }`}
                    aria-expanded={open}
                    onClick={() =>
                      setOpenMobileGroup((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <Chevron open={open} />
                  </button>
                  {open && (
                    <div className="pb-2 pl-3 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block py-2 text-sm ${
                            pathMatches(pathname, child.href)
                              ? "text-laf-gold font-medium"
                              : "text-laf-muted hover:text-laf-navy"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 py-2.5 text-center text-sm font-semibold rounded-lg border border-laf-navy text-laf-navy"
            >
              Portal
            </a>
          )}
          <Link
            href="/donate"
            className="block mt-2 py-2.5 text-center text-sm font-semibold rounded-lg bg-laf-gold text-white"
          >
            Donate Now
          </Link>
        </div>
      )}
    </nav>
  );
}
