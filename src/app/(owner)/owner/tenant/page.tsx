// FR: FR-S12
// Service: api.getMyTenant, api.updateMyTenant
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantProfileView } from "@/features/tenant/components/TenantProfileView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerTenantProfilePage() {
  const tenant = await api.getMyTenant();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông Tin Tổ Chức / Khách Hàng (Tenant)"
        description="Quản lý hồ sơ pháp nhân, thương hiệu chuỗi khách sạn và thông tin giới hạn tài nguyên."
      />
      <TenantProfileView initialTenant={tenant} />
    </div>
  );
}
