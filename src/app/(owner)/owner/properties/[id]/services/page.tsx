"use client";

// FR: FR-C08, FR-C09, FR-C13
// API: GET /api/services/catalog, GET/POST /api/properties/{id}/services, PATCH .../{propertyServiceId}/status
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { ServiceConfig } from "@/features/property-config/components/ServiceConfig";
import { propertyApi, serviceApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, catalog, services] = await Promise.all([
      propertyApi.get(id),
      serviceApi.catalog(),
      serviceApi.list(id),
    ]);
    return { property, catalog, services };
  });

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
        title={`Dịch Vụ Khách Sạn: ${data?.property.name ?? ""}`}
        description="Lựa chọn các tiện ích từ danh mục chuẩn SaaS và bật/tắt dịch vụ tại cơ sở."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <ServiceConfig propertyId={id} catalog={data.catalog} initialServices={data.services} />}
      </AsyncBoundary>
    </div>
  );
}
