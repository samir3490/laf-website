import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PageContainer from "@/components/PageContainer";
import AdminDrawingApp from "@/components/drawing/AdminDrawingApp";

export const metadata: Metadata = {
  title: "Drawing Competition Admin | Lata Agrawal Foundation",
  robots: { index: false, follow: false },
};

export default function AdminDrawingPage() {
  return (
    <>
      <PageHeader title="Drawing Competition Admin" />
      <PageContainer className="py-12 lg:py-16">
        <AdminDrawingApp />
      </PageContainer>
    </>
  );
}
