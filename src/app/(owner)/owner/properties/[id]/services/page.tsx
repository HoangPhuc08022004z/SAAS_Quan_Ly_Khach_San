// FR: FR-C08, FR-C09, FR-C13
// Service: api.listServiceCatalog, api.listPropertyServices, api.createPropertyService, api.updatePropertyService, api.deletePropertyService
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceConfig } from "@/features/property-config/components/ServiceConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, catalog, services] = await Promise.all([
    api.getProperty(id),
    api.listServiceCatalog(),
    api.listPropertyServices(id),
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
        title={`Dịch Vụ Khách Sạn: ${property.name}`}
        description="Lựa chọn các tiện ích từ danh mục chuẩn SaaS và điều chỉnh biểu phí phục vụ tại cơ sở."
      />

      <ServiceConfig
        propertyId={id}
        catalog={catalog}
        initialServices={services}
      />
    </div>
  );
}
