import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import HubSpotForm from "@/components/HubSpotForm";
import volunteer from "@/content/volunteer.json";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Become a Volunteer",
  description:
    "Volunteer with the Lata Agrawal Foundation in Wardha and across India — mentor children, support education programs, and join our community of changemakers.",
  path: "/volunteer",
});

export default function VolunteerPage() {
  return (
    <>
      <PageHeader title="Become a Volunteer" />
      <PageContainer className="py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-laf-navy">{volunteer.whyTitle}</h2>
              <p className="mt-4 text-laf-muted leading-relaxed">{volunteer.whyIntro}</p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-4">
                {volunteer.benefits.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-laf-border bg-white p-5"
                  >
                    <h3 className="font-semibold text-laf-navy">{item.title}</h3>
                    <p className="mt-2 text-sm text-laf-muted leading-relaxed">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-laf-navy">{volunteer.howTitle}</h2>
              <p className="mt-4 text-laf-muted leading-relaxed">{volunteer.howIntro}</p>
              <ul className="mt-6 space-y-4">
                {volunteer.ways.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-laf-border bg-laf-cream/50 px-5 py-4"
                  >
                    <h3 className="font-semibold text-laf-navy">{item.title}</h3>
                    <p className="mt-1 text-sm text-laf-muted">{item.description}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-laf-muted">
                Prefer to donate money or goods?{" "}
                <Link href="/donate" className="text-laf-gold font-medium hover:underline">
                  Donate online
                </Link>{" "}
                or{" "}
                <Link href="/ways-to-help" className="text-laf-gold font-medium hover:underline">
                  see all ways to help
                </Link>
                .
              </p>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-laf-border bg-white p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-laf-navy mb-2">Join Our Volunteer Network</h2>
              <p className="text-sm text-laf-muted mb-6">
                Fill out the form and our team will reach out with opportunities that match your
                skills and availability.
              </p>
              <HubSpotForm formKey="volunteer" />
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
