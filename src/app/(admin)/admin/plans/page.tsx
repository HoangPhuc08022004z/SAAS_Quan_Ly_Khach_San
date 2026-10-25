"use client";

// FR-S02: Quản lý danh mục gói dịch vụ SaaS
// API: GET /api/v1/saas/user/Plan/List
import React from "react";
import { fetchPlans } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PlanTable } from "@/features/admin/components/PlanManagement";

export default function AdminPlansPage() {
  const { data, loading, error, reload } = useAsyncData(async () => (await fetchPlans()).map(toPlan));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Gói Dịch Vụ SaaS"
        description="Định cấu hình các gói thuê bao, giá tiền, thời hạn và giới hạn tài nguyên."
        breadcrumbs={[{ label: "SaaS Admin", href: "/admin" }, { label: "Gói dịch vụ" }]}
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PlanTable initialPlans={data} />}
      </AsyncBoundary>
    </div>
  );
}
