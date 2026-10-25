"use client";

// FR: FR-S03
// API: GET /api/v1/saas/user/Plan/List, POST /api/v1/user/sendRequest
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SubscribeWizard } from "@/features/subscription/components/SubscribeWizard";
import { fetchPlans } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerSubscribePage() {
  const { data, loading, error, reload } = useAsyncData(async () =>
    (await fetchPlans()).filter((p) => p.status === "ACTIVE").map(toPlan)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đăng Ký Thuê Bao Dịch Vụ SaaS"
        description="Đăng ký gói dịch vụ quản trị khách sạn. Yêu cầu sẽ được SaaS Admin xét duyệt trước khi thanh toán."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && data.length > 0 ? (
          <SubscribeWizard plans={data} />
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">Hiện chưa có gói dịch vụ nào đang mở đăng ký.</div>
        )}
      </AsyncBoundary>
    </div>
  );
}
