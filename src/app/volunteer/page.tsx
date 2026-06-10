import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WpContent from "@/components/WpContent";
import Button from "@/components/Button";
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
        <div className="mt-10 text-center">
          <Button href="/contact">Get in Touch</Button>
        </div>
      </div>
    </>
  );
}
