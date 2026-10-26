"use client";

// FR: FR-C01, FR-C13
// API: GET /api/properties/{id}, PUT /api/properties/{id}, DELETE /api/properties/{id}
import React, { use } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { PropertyForm } from "@/features/property-config/components/PropertyForm";
import { propertyApi } from "@/lib/api";
import { toUiProperty } from "@/lib/api/adapters";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => toUiProperty(await propertyApi.get(id)));

  return (
    <div className="space-y-6">
      <PageHeader
        title={data ? `Chỉnh Sửa Thông Tin: ${data.name}` : "Chỉnh Sửa Thông Tin Khách Sạn"}
        description="Cập nhật địa chỉ, thông tin hotline, email liên hệ và ảnh bìa khách sạn."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <PropertyForm initialData={data} isEdit={true} />}
      </AsyncBoundary>
    </div>
  );
}
