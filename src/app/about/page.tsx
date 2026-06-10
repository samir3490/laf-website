import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import ImpactGrid from "@/components/ImpactGrid";
import about from "@/content/about.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "About the Lata Agrawal Foundation — an NGO in Wardha, Maharashtra empowering children through education, nutrition, and community programs across India.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Us" subtitle="Empowering smiles, changing lives" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_min(380px,35%)] gap-10 lg:gap-14 items-start mb-16">
          <div className="space-y-6">
            <p className="text-lg text-laf-muted leading-relaxed">{about.intro}</p>
            <p className="text-laf-muted leading-relaxed">{about.belief}</p>
          </div>
          <div className="relative aspect-[4/3] max-w-sm mx-auto lg:mx-0 lg:ml-auto w-full rounded-2xl overflow-hidden border border-laf-border shadow-md">
            <Image
              src="/images/2024/12/mission-ngo-lata.webp"
              alt="Lata Agrawal Foundation supporting education and community programs"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 80vw, 380px"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <section className="rounded-2xl border border-laf-border bg-white p-8">
            <h2 className="text-2xl font-bold text-laf-navy">{about.mission.title}</h2>
            <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
            <p className="text-laf-muted leading-relaxed">{about.mission.body}</p>
          </section>
          <section className="rounded-2xl border border-laf-border bg-white p-8">
            <h2 className="text-2xl font-bold text-laf-navy">{about.vision.title}</h2>
            <div className="w-12 h-1 bg-laf-gold mt-3 mb-5 rounded-full" />
            <p className="text-laf-muted leading-relaxed">{about.vision.body}</p>
          </section>
        </div>

        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-laf-navy text-center">Impact Created</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-10 rounded-full" />
          <ImpactGrid items={about.impact} />
        </section>

        <section className="rounded-2xl bg-laf-navy text-white p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold">{about.team.title}</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto leading-relaxed">{about.team.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/volunteer"
              className="px-6 py-2.5 rounded-lg bg-laf-gold text-white font-semibold text-sm hover:bg-laf-gold-bright transition-colors"
            >
              Become a Volunteer
            </Link>
            <Link
              href="/donate"
              className="px-6 py-2.5 rounded-lg border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
            >
              Donate
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
