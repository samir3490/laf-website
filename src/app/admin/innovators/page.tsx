import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import AdminInnovatorsApp from "@/components/innovators/AdminInnovatorsApp";

export const metadata: Metadata = {
  title: "Young Innovators Admin | Lata Agrawal Foundation",
  robots: { index: false, follow: false },
};

export default function AdminInnovatorsPage() {
  return (
    <>
      <PageHeader title="Young Innovators Admin" />
      <PageContainer className="py-12 lg:py-16">
        <p className="mb-8 text-sm text-laf-muted max-w-2xl">
          Approve projects for the public gallery, or remove entries. Certificates are handled
          separately after you confirm valid submissions.
        </p>
        <AdminInnovatorsApp />
      </PageContainer>
    </>
  );
}
