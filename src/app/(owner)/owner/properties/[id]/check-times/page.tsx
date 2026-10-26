"use client";

// FR: FR-C03
// Tên khách sạn: API thật GET /api/properties/{id}. Giờ nhận/trả phòng: backend chưa có API → vẫn dùng mock.
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { CheckTimeForm } from "@/features/property-config/components/CheckTimeForm";
import { api, propertyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyCheckTimesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, times] = await Promise.all([propertyApi.get(id), api.getCheckTimes(id)]);
    return { property, times };
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
        description="Quy định mốc thời gian nhận phòng và trả phòng tiêu chuẩn hàng ngày cho khách lưu trú."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <CheckTimeForm propertyId={id} initialTimes={data.times} />}
      </AsyncBoundary>
    </div>
  );
}
