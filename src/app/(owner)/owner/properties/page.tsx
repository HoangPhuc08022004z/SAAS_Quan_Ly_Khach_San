"use client";

// FR: FR-C01
// API: GET /api/properties (+ tiến độ thiết lập tính từ các API cấu hình)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PropertyList } from "@/features/property-config/components/PropertyList";
import { propertyApi, computeSetupStatus } from "@/lib/api";
import { toUiProperty } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerPropertiesPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const properties = (await propertyApi.list()).map(toUiProperty);
    const statuses = await Promise.all(properties.map((p) => computeSetupStatus(p.id)));
    const setupStatuses = Object.fromEntries(properties.map((p, i) => [p.id, statuses[i]]));
    return { properties, setupStatuses };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh Sách Cơ Sở Khách Sạn (Properties)"
        description="Quản lý các chi nhánh khách sạn thuộc chuỗi, kiểm tra tiến độ thiết lập và truy cập các module cấu hình."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PropertyList initialProperties={data.properties} setupStatuses={data.setupStatuses} />}
      </AsyncBoundary>
    </div>
  );
}
