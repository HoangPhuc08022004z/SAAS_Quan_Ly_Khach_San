"use client";

// FR: FR-C03
// Giờ nhận/trả phòng là một loại chính sách của backend → dùng chung API chính sách (dữ liệu thật):
// GET /api/policy-formulas, GET/POST /api/properties/{id}/hotel-policies
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PolicyConfig } from "@/features/property-config/components/PolicyConfig";
import { propertyApi, policyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyCheckTimesPage({ params }: { params: Promise<{ id: string }> }) {
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
        title={`Giờ Nhận / Trả Phòng: ${data?.property.name ?? ""}`}
        description="Thiết lập giờ nhận phòng và giờ trả phòng tiêu chuẩn của khách sạn."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <PolicyConfig propertyId={id} formulas={data.formulas} initialApplied={data.applied} scope="check" />
        )}
      </AsyncBoundary>
    </div>
  );
}
