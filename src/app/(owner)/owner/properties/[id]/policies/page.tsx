"use client";

// FR: FR-C02, FR-C13
// API: GET /api/policy-formulas, GET/POST /api/properties/{id}/hotel-policies
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PolicyConfig } from "@/features/property-config/components/PolicyConfig";
import { propertyApi, policyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyPoliciesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, formulas, applied] = await Promise.all([
      propertyApi.get(id),
      policyApi.formulas(),
      policyApi.get(id),
    ]);
    return { property, formulas, applied: applied.policies ?? [] };
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
        title={`Chính Sách & Quy Định: ${data?.property.name ?? ""}`}
        description="Cấu hình các công thức hủy phòng, đặt cọc và quy tắc xử lý vắng mặt (No-Show) tự động."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PolicyConfig propertyId={id} formulas={data.formulas} initialApplied={data.applied} />}
      </AsyncBoundary>
    </div>
  );
}
