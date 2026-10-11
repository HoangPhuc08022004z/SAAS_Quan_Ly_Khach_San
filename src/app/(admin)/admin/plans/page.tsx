// FR-S02: Quản lý danh mục gói dịch vụ SaaS
// Service: api.adminListPlans, api.adminCreatePlan, api.adminSetPlanStatus

import React from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanTable } from "@/features/admin/components/PlanManagement";

export default async function AdminPlansPage() {
  const plans = await api.adminListPlans();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Gói Dịch Vụ SaaS"
        description="Định cấu hình các gói thuê bao, giá tiền, thời hạn và giới hạn tài nguyên."
        breadcrumbs={[{ label: "SaaS Admin", href: "/admin" }, { label: "Gói dịch vụ" }]}
      />

      <PlanTable initialPlans={plans} />
    </div>
  );
}
