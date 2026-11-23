"use client";

// API: GET /api/owner/daily-statistics (xem OwnerReportsView)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { OwnerReportsView } from "@/features/owner-reports/components/OwnerReportsView";

export default function OwnerReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo Night Audit các khách sạn"
        description="Số liệu thống kê hằng ngày của mọi khách sạn trong tenant. Manager của từng khách sạn là người điều chỉnh và chốt báo cáo."
      />
      <OwnerReportsView />
    </div>
  );
}
