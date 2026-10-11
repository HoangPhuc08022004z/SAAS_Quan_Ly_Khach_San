// FR: FR-C01
// Service: api.listProperties, api.getSetupStatus
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyList } from "@/features/property-config/components/PropertyList";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerPropertiesPage() {
  const [properties, tenant] = await Promise.all([
    api.listProperties(),
    api.getMyTenant(),
  ]);

  const setupStatuses: Record<string, any> = {};
  for (const p of properties) {
    setupStatuses[p.id] = await api.getSetupStatus(p.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Cơ Sở Khách Sạn (Properties)"
        description="Quản lý các chi nhánh khách sạn thuộc chuỗi, kiểm tra tiến độ thiết lập và truy cập các module cấu hình."
      />
      <PropertyList
        initialProperties={properties}
        maxProperties={tenant.max_properties}
        setupStatuses={setupStatuses}
      />
    </div>
  );
}
