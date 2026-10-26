"use client";

// FR: FR-C10, FR-C13
// API: GET/POST /api/properties/{id}/fnb-menu, PATCH .../{menuId}, PATCH .../{menuId}/status
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { FnbConfig } from "@/features/property-config/components/FnbConfig";
import { propertyApi, fnbApi } from "@/lib/api";
import { toUiFnb } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyFnbPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, menu] = await Promise.all([propertyApi.get(id), fnbApi.list(id)]);
    return { property, menu: menu.map(toUiFnb) };
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
        title={`Thực Đơn Ẩm Thực (F&B): ${data?.property.name ?? ""}`}
        description="Quản lý danh mục món ăn đồ uống phục vụ tại phòng hoặc nhà hàng, tự động xác định giá bán theo tỷ suất lợi nhuận."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <FnbConfig propertyId={id} initialMenu={data.menu} />}
      </AsyncBoundary>
    </div>
  );
}
