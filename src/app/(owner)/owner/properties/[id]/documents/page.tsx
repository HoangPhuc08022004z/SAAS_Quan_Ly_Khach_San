// FR: FR-C04, FR-C13
// Service: api.listPropertyDocs, api.uploadPropertyDoc, api.deletePropertyDoc
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { DocumentConfig } from "@/features/property-config/components/DocumentConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, docs] = await Promise.all([
    api.getProperty(id),
    api.listPropertyDocs(id),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${id}/setup`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Wizard thiết lập</span>
        </Link>
      </div>

      <PageHeader
        title={`Tài Liệu & Nội Quy Khách Sạn: ${property.name}`}
        description="Nạp cẩm nang hướng dẫn, tiện ích và quy định vào cơ sở dữ liệu tri thức của trợ lý ảo AI."
      />

      <DocumentConfig propertyId={id} initialDocs={docs} />
    </div>
  );
}
