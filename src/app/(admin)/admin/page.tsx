// FR-S15: Bảng điều khiển SaaS Admin
// Service: api.adminGetOverview, api.adminListTenants, api.adminListSubscriptions

import React from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/data/StatCard";
import { formatMoney } from "@/lib/utils/money";
import { DashboardCharts, PendingApprovalList, ExpiringTenantTable } from "@/features/admin/components/DashboardCharts";

export default async function AdminDashboardPage() {
  const overview = await api.adminGetOverview();
  const pendingSubscriptions = await api.adminListSubscriptions({ status: "PENDING" });
  const allTenants = await api.adminListTenants();

  // Find expiring tenants (Sunrise Hotel)
  const expiringTenants = allTenants.filter((t: any) => t.id === "tenant_sunrise");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng Điều Khiển Nền Tảng (SaaS Overview)"
        description="Tổng quan doanh thu, số lượng Tenant và các tác vụ phê duyệt cần xử lý."
        breadcrumbs={[{ label: "SaaS Admin" }, { label: "Bảng điều khiển" }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Doanh Thu Thuê Bao"
          value={formatMoney(overview.totalRevenue)}
          subtitle="Tất cả giao dịch thành công"
          iconName="CreditCard"
          trend={{ value: "14.2%", isUp: true }}
        />
        <StatCard
          title="Tenant Đang Hoạt Động"
          value={overview.activeTenants}
          subtitle={`Tổng số: ${overview.activeTenants + overview.suspendedTenants} tổ chức`}
          iconName="Building2"
        />
        <StatCard
          title="Yêu Cầu Chờ Xét Duyệt"
          value={overview.pendingApprovals}
          subtitle="Đơn đăng ký mới"
          iconName="Clock"
        />
        <StatCard
          title="Sắp Hết Hạn (≤ 7 ngày)"
          value={overview.expiringSoonCount}
          subtitle="Cần nhắc gia hạn"
          iconName="AlertTriangle"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        monthlyRevenue={overview.monthlyRevenue}
        tenantStats={{
          active: overview.activeTenants,
          suspended: overview.suspendedTenants,
          pending: overview.pendingApprovals,
        }}
        pendingList={pendingSubscriptions}
      />

      {/* Lower Grids: Pending approvals & Expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingApprovalList list={pendingSubscriptions} />
        <ExpiringTenantTable list={expiringTenants} />
      </div>
    </div>
  );
}
