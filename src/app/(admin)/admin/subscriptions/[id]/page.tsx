"use client";

// FR-S04, FR-S05: Chi tiết yêu cầu đăng ký thuê bao & Phê duyệt / Từ chối
// API: GET /api/v1/user/subscriptions/pending (lọc theo id), POST /api/admin/subscriptions/{id}/approve|reject
import React, { use } from "react";
import { fetchPendingSubscriptions } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SubscriptionDetailView } from "@/features/admin/components/SubscriptionManagement";

export default function AdminSubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const sub = (await fetchPendingSubscriptions()).find((s) => String(s.subscriptionId) === id);
    if (!sub) throw new Error("Không tìm thấy yêu cầu đang chờ duyệt (có thể đã được xử lý).");
    return sub;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Yêu Cầu Thuê Bao: ${data?.tenantName ?? `#${id}`}`}
        description={`Mã đơn: ${id}`}
        breadcrumbs={[
          { label: "SaaS Admin", href: "/admin" },
          { label: "Duyệt đăng ký", href: "/admin/subscriptions" },
          { label: "Chi tiết yêu cầu" },
        ]}
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <SubscriptionDetailView subscription={data} />}
      </AsyncBoundary>
    </div>
  );
}
