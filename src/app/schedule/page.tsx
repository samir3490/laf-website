import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import ScheduleBookingClient from "@/components/ScheduleBookingClient";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Schedule Volunteer Intro Call",
  description:
    "Pick a free 30-minute Google Meet slot for your introductory call with the Lata Agrawal Foundation.",
  path: "/schedule",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = firstParam(params.email).trim();
  const name = firstParam(params.name).trim();

  return (
    <>
      <PageHeader
        title="Schedule your intro call"
        subtitle="Choose a 30-minute Google Meet time that works for you — only open slots are shown."
      />
      <PageContainer className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-laf-muted leading-relaxed">
            After you complete our{" "}
            <Link href="/volunteer" className="text-laf-gold font-medium hover:underline">
              volunteer form
            </Link>
            , use this page to book your introductory call. You will receive a calendar invite with
            the Google Meet link at the email you use below.
          </p>
          <ScheduleBookingClient initialEmail={email} initialName={name} />
        </div>
      </PageContainer>
    </>
  );
}
