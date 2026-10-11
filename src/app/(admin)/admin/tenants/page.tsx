// FR: FR-S13, FR-S15
// Service: api.adminListTenants
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantTable } from "@/features/admin/components/TenantManagement";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  const tenants = await api.adminListTenants();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Khách Hàng Doanh Nghiệp (Tenants)"
        description="Theo dõi danh sách các tổ chức, khách sạn trực thuộc, trạng thái hoạt động và kỳ hạn thuê bao."
      />
      <TenantTable initialTenants={tenants} />
    </div>
  );
}
