"use client";

// FR: FR-C12, FR-C13
// API thật: GET /api/properties/{id}, GET /api/payment-gateways, GET /api/properties/{id}/payment-gateway (404 = chưa cấu hình)
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { GatewayConfig } from "@/features/property-config/components/GatewayConfig";
import { paymentGatewayApi, propertyApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyPaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, gateways, config] = await Promise.all([
      propertyApi.get(id),
      paymentGatewayApi.catalog().catch(() => []),
      paymentGatewayApi.get(id).catch((e: any) => {
        // 404 = khách sạn chưa cấu hình cổng; lỗi khác thì báo ra
        if (/404|không tìm thấy|chưa cấu hình|not found/i.test(String(e?.message))) return null;
        throw e;
      }),
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
        description="Kết nối Stripe của khách sạn để khách thanh toán tiền cọc trực tuyến khi đặt phòng."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <GatewayConfig propertyId={id} gateways={data.gateways} initialConfig={data.config} />}
      </AsyncBoundary>
    </div>
  );
}
