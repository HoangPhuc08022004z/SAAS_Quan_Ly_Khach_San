"use client";

// FR: FR-C12, FR-C13
// Tên khách sạn: API thật GET /api/properties/{id}. Cổng thanh toán: backend chưa có API → vẫn dùng mock.
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { GatewayConfig } from "@/features/property-config/components/GatewayConfig";
import { api, propertyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyPaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, gateways, config] = await Promise.all([
      propertyApi.get(id),
      api.listGateways(),
      api.getGatewayConfig(id),
    ]);
    return { property, gateways, config };
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
        title={`Cấu Hình Cổng Thanh Toán: ${data?.property.name ?? ""}`}
        description="Kết nối đối tác cổng thanh toán trực tuyến (MoMo, VNPAY, ZaloPay) để tự động thu cọc và quyết toán."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <GatewayConfig propertyId={id} gateways={data.gateways} initialConfig={data.config} />}
      </AsyncBoundary>
    </div>
  );
}
