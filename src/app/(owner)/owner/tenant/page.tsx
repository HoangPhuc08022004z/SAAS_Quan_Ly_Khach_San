"use client";

// Thông tin tổ chức — dữ liệu thật: GET /api/v1/user/profile (backend chưa có API sửa tổ chức)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { TenantProfileView } from "@/features/tenant/components/TenantProfileView";
import { saasApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function OwnerTenantProfilePage() {
  const { data, loading, error, reload } = useAsyncData(() => saasApi.profile.get());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thông Tin Tổ Chức / Khách Hàng (Tenant)"
        description="Hồ sơ tổ chức và trạng thái thuê bao của bạn."
      />
      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <TenantProfileView profile={data} />}
      </AsyncBoundary>
    </div>
  );
}
