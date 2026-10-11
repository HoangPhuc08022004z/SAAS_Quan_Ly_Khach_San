// FR-S02: Chỉnh sửa thông tin gói dịch vụ
// Service: api.adminGetPlan, api.adminUpdatePlan

import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanForm } from "@/features/admin/components/PlanForm";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const plan = await api.adminGetPlan(id);

    return (
      <div className="space-y-6">
        <PageHeader
          title={`Chỉnh Sửa: ${plan.name}`}
          description="Cập nhật cấu hình gói dịch vụ và các giới hạn hệ thống."
          breadcrumbs={[
            { label: "SaaS Admin", href: "/admin" },
            { label: "Gói dịch vụ", href: "/admin/plans" },
            { label: plan.name },
          ]}
        />

        <PlanForm initialPlan={plan} />
      </div>
    );
  } catch {
    notFound();
  }
}
