"use client";

// FR-S02: Chỉnh sửa thông tin gói dịch vụ
// API: GET /api/v1/saas/user/Plan/List (lọc theo id), PUT /api/v1/saas/admin/Plan/{planId}
import React, { use } from "react";
import { fetchPlans } from "@/lib/api";
import { toPlan } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PlanForm } from "@/features/admin/components/PlanForm";

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Plan/Detail trả 200 body rỗng khi không có Plan nên dùng List rồi lọc cho an toàn
  const { data, loading, error, reload } = useAsyncData(async () => {
    const plan = (await fetchPlans()).find((p) => String(p.planId) === id);
    if (!plan) throw new Error("Không tìm thấy gói dịch vụ.");
    return toPlan(plan);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={data ? `Chỉnh Sửa: ${data.name}` : "Chỉnh Sửa Gói Dịch Vụ"}
        description="Cập nhật cấu hình gói dịch vụ và các giới hạn hệ thống."
        breadcrumbs={[
          { label: "SaaS Admin", href: "/admin" },
          { label: "Gói dịch vụ", href: "/admin/plans" },
          { label: data?.name || "Chỉnh sửa" },
        ]}
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PlanForm initialPlan={data} />}
      </AsyncBoundary>
    </div>
  );
}
