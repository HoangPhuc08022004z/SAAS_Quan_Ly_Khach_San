// FR: FR-S11, FR-S13, FR-S15, FR-S16
// Service: api.adminGetTenant, api.adminSetTenantStatus, api.adminCreateTenant
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantDetailView } from "@/features/admin/components/TenantManagement";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await api.adminGetTenant(id);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách Tenants</span>
        </Link>
      </div>

      <PageHeader
        title={`Chi Tiết Khách Hàng: ${tenant.name}`}
        description="Quản lý cấu hình giới hạn, mức độ sử dụng tài nguyên và trạng thái hoạt động."
      />

      <TenantDetailView tenant={tenant} />
    </div>
  );
}
