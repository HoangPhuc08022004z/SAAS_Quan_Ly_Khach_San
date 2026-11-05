"use client";

// Bảng điều khiển SaaS Admin — dữ liệu thật:
// GET /api/v1/saas/user/Plan/List, GET /api/v1/user/subscriptions/pending, GET /api/v1/saas/admin/support-tickets
// Doanh thu / danh sách Tenant chưa có API nên không hiển thị.
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { StatCard } from "@/components/data/StatCard";
import { PendingApprovalList } from "@/features/admin/components/DashboardCharts";
import { fetchPlans, saasApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [plans, pending, tickets] = await Promise.all([
      fetchPlans(),
      saasApi.subscriptions.listPending(),
      saasApi.tickets.list(),
    ]);
    return {
      activePlans: plans.filter((p) => p.status === "ACTIVE").length,
      totalPlans: plans.length,
      pending: pending.length,
      openTickets: tickets.filter((t) => t.status === "OPEN").length,
      totalTickets: tickets.length,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng Điều Khiển Nền Tảng (SaaS Overview)"
        description="Tổng quan gói dịch vụ, yêu cầu thuê bao cần duyệt và ticket hỗ trợ."
        breadcrumbs={[{ label: "SaaS Admin" }, { label: "Bảng điều khiển" }]}
      />

      <AsyncBoundary loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Gói Đang Hoạt Động"
              value={data.activePlans}
              subtitle={`Tổng số gói: ${data.totalPlans}`}
              iconName="Layers"
            />
            <StatCard
              title="Yêu Cầu Chờ Xét Duyệt"
              value={data.pending}
              subtitle="Đơn đăng ký thuê bao mới"
              iconName="Clock"
            />
            <StatCard
              title="Ticket Đang Mở"
              value={data.openTickets}
              subtitle={`Tổng số ticket: ${data.totalTickets}`}
              iconName="Headphones"
            />
            <StatCard
              title="Ticket Đã Xử Lý"
              value={data.totalTickets - data.openTickets}
              subtitle="Đã giải quyết hoặc đóng"
              iconName="CheckSquare"
            />
          </div>
        )}
      </AsyncBoundary>

      <PendingApprovalList />
    </div>
  );
}
