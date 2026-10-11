// FR-S02: Thêm mới gói dịch vụ
// Service: api.adminCreatePlan

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlanForm } from "@/features/admin/components/PlanForm";

export default function NewPlanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Gói Dịch Vụ Mới"
        description="Thiết lập tên gói, định giá, chu kỳ tính phí và các giới hạn khách sạn, phòng, tài khoản."
        breadcrumbs={[
          { label: "SaaS Admin", href: "/admin" },
          { label: "Gói dịch vụ", href: "/admin/plans" },
          { label: "Tạo gói mới" },
        ]}
      />

      <PlanForm />
    </div>
  );
}
