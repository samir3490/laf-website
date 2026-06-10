import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import AdminLibraryApp from "@/components/library/AdminLibraryApp";

export const metadata: Metadata = {
  title: "Library Admin | Lata Agrawal Foundation",
  robots: { index: false, follow: false },
};

export default function AdminLibraryPage() {
  return (
    <>
      <PageHeader
        title="Library Admin"
        subtitle="Review submissions and manage the learning resource catalog"
      />
      <PageContainer className="py-12 lg:py-16">
        <AdminLibraryApp />
      </PageContainer>
    </>
  );
}
