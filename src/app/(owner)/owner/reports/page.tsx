// FR: FR-O44, FR-O52
// Service: api.listOwnerReports, api.approveReport
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerReportsView } from "@/features/owner-reports/components/OwnerReportsView";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerReportsPage() {
  const reports = await api.listOwnerReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo Cáo Hoạt Động & Chốt Ngày Các Khách Sạn"
        description="Giám sát số liệu Night Audit, doanh thu phòng, F&B và thực hiện xác nhận báo cáo định kỳ cho các cơ sở."
      />
      <OwnerReportsView initialReports={reports} />
    </div>
  );
}
