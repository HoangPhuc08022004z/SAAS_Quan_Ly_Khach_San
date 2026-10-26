"use client";

// FR: FR-C01 đến FR-C12
// API: GET /api/properties/{id} + tiến độ tính từ các API cấu hình
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SetupWizard } from "@/features/property-config/components/SetupWizard";
import { propertyApi, computeSetupStatus } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertySetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, setupStatus] = await Promise.all([propertyApi.get(id), computeSetupStatus(id)]);
    return { property, setupStatus };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/owner/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khách sạn</span>
        </Link>
      </div>

      <PageHeader
        title={`Tiến Trình Thiết Lập: ${data?.property.name ?? ""}`}
        description="Danh sách các bước cấu hình cần thiết để đưa khách sạn vào trạng thái sẵn sàng đón khách."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <SetupWizard propertyId={id} propertyName={data.property.name} setupStatus={data.setupStatus} />}
      </AsyncBoundary>
    </div>
  );
}
