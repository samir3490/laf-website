import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import AdminLibraryApp from "@/components/library/AdminLibraryApp";

export const metadata: Metadata = {
  title: { absolute: "Library Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLibraryPage() {
  return (
    <>
      <PageHeader title="Library Admin" />
      <PageContainer className="py-12 lg:py-16">
        <AdminLibraryApp />
      </PageContainer>
    </>
  );
}
