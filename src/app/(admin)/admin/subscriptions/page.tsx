"use client";

// FR-S04, FR-S05: Hàng đợi xét duyệt yêu cầu đăng ký thuê bao
// API: GET /api/v1/user/subscriptions/pending
import React from "react";
import { fetchPendingSubscriptions } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SubscriptionTable } from "@/features/admin/components/SubscriptionManagement";

export default function AdminSubscriptionsPage() {
  const { data, loading, error, reload } = useAsyncData(fetchPendingSubscriptions);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Xét Duyệt Yêu Cầu Thuê Bao"
        description="Xem xét hồ sơ doanh nghiệp khách sạn, duyệt đăng ký hoặc từ chối."
        breadcrumbs={[{ label: "SaaS Admin", href: "/admin" }, { label: "Duyệt đăng ký" }]}
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <SubscriptionTable initialList={data} />}
      </AsyncBoundary>
    </div>
  );
}
