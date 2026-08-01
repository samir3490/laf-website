import Link from "next/link";
import Image from "next/image";
import PageContainer from "@/components/PageContainer";
import SocialLinks from "@/components/SocialLinks";
import { getSite } from "@/lib/content";

export default function Footer() {
  const site = getSite();

  return (
    <footer className="bg-laf-navy text-white mt-auto">
      <PageContainer className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Image
              src="/logo.png"
              alt="Lata Agrawal Foundation"
              width={280}
              height={70}
              className="h-14 w-auto max-w-[240px] object-contain rounded-lg bg-laf-cream p-2"
            />
            <p className="mt-4 text-white/75 text-sm leading-relaxed">{site.tagline}</p>
            <SocialLinks variant="footer" className="mt-5" />
          </div>
          <div>
            <p className="font-semibold text-laf-gold mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/how-we-help" className="hover:text-white">How We Help</Link></li>
              <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
              <li><Link href="/events" className="hover:text-white">Events</Link></li>
              <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link href="/ways-to-help" className="hover:text-white">Ways to Help</Link></li>
              <li><Link href="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/library" className="hover:text-white">Learning Library</Link></li>
              {site.portalUrl && (
                <li>
                  <a href={site.portalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Portal
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-laf-gold mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {site.contact.phone}
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
      </PageContainer>
    </footer>
  );
}
