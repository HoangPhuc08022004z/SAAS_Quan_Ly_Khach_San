// FR: FR-O44
// Service: api.getOwnerOverview
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerOverview } from "@/features/owner-reports/components/OwnerOverview";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const overview = await api.getOwnerOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng Quan Chuỗi Khách Sạn (Owner Dashboard)"
        description="Theo dõi toàn diện doanh thu chuỗi, công suất phòng trung bình và tình hình chốt số liệu báo cáo ngày."
      />
      <OwnerOverview data={overview} />
    </div>
  );
}
