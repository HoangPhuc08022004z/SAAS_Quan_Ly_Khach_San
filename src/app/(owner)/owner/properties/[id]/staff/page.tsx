"use client";

// FR: FR-C11, FR-C13
// API: GET /api/roles, GET/POST /api/properties/{id}/users, PUT/DELETE .../users/{userId}
import React, { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { StaffConfig } from "@/features/property-config/components/StaffConfig";
import { propertyApi, userApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { ArrowLeft } from "lucide-react";

export default function PropertyStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [property, roles, staff] = await Promise.all([propertyApi.get(id), userApi.roles(), userApi.list(id)]);
    return { property, roles, staff };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${id}/setup`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Wizard thiết lập</span>
        </Link>
      </div>

      <PageHeader
        title={`Quản Lý Nhân Viên & Phân Quyền: ${data?.property.name ?? ""}`}
        description="Khởi tạo tài khoản nhân viên PMS cho quản lý, lễ tân, buồng phòng."
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && <StaffConfig propertyId={id} roles={data.roles} initialStaff={data.staff} />}
      </AsyncBoundary>
    </div>
  );
}
