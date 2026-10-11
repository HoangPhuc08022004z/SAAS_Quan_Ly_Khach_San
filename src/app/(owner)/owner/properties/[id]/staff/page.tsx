// FR: FR-C11, FR-C13
// Service: api.listRoles, api.listPermissions, api.listStaff, api.createStaff, api.updateStaff, api.setStaffRole, api.setStaffStatus, api.resetStaffPassword
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StaffConfig } from "@/features/property-config/components/StaffConfig";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertyStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, roles, permissions, staff] = await Promise.all([
    api.getProperty(id),
    api.listRoles(),
    api.listPermissions(),
    api.listStaff(id),
  ]);

  if (!property) {
    notFound();
  }

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
        title={`Quản Lý Nhân Viên & Phân Quyền: ${property.name}`}
        description="Khởi tạo tài khoản nhân viên PMS cho quản lý, lễ tân, buồng phòng và xem trước bảng quyền hạn."
      />

      <StaffConfig
        propertyId={id}
        roles={roles}
        permissions={permissions}
        initialStaff={staff}
      />
    </div>
  );
}
