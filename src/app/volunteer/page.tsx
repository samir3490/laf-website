import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import HubSpotForm from "@/components/HubSpotForm";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Become a volunteer with the Lata Agrawal Foundation.",
};

export default function VolunteerPage() {
  const page = getPage("become-a-volunteer");

  return (
    <>
      <PageHeader
        title="Become a Volunteer"
        subtitle="Offer your time and skills to mentor, teach, and support our programs"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {page && <WpContent html={page.html} />}
        <section className="mt-12 rounded-2xl border border-laf-border bg-white p-6 md:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-laf-navy text-center mb-8">
            To Join Please Fill Out the Form Below
          </h2>
          <HubSpotForm formKey="volunteer" />
        </section>
      </div>
    </>
  );
}
