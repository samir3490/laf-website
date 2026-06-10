import Link from "next/link";
import { getSite } from "@/lib/content";

export default function Footer() {
  const site = getSite();

  return (
    <footer className="bg-laf-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <p className="font-bold text-lg">
              <span className="text-laf-gold">Lata Agrawal</span> Foundation
            </p>
            <p className="mt-3 text-white/75 text-sm leading-relaxed">
              {site.tagline}
            </p>
          </div>
          <div>
            <p className="font-semibold text-laf-gold mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link href="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-laf-gold mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                  {site.contact.email}
                </a>
              </li>
              <li>{site.contact.address}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Lata Agrawal Foundation. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
