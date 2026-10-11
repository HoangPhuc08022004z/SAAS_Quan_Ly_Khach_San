"use client";

import React from "react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { formatMoney } from "@/lib/utils/money";
import { StatusBadge } from "@/components/data/StatusBadge";
import { ArrowRight, AlertTriangle, Clock } from "lucide-react";

interface DashboardChartsProps {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  tenantStats: { active: number; suspended: number; pending: number };
  pendingList: any[];
}

export function DashboardCharts({ monthlyRevenue, tenantStats, pendingList }: DashboardChartsProps) {
  const pieData = [
    { name: "Hoạt động", value: tenantStats.active, color: "#10b981" },
    { name: "Bị khóa", value: tenantStats.suspended, color: "#f43f5e" },
    { name: "Chờ duyệt", value: tenantStats.pending, color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Chart */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Doanh Thu Thuê Bao 6 Tháng Gần Nhất
          </h3>
          <span className="text-xs text-slate-400">Đơn vị: VNĐ</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val / 1000000}tr`} />
              <Tooltip
                formatter={(value: any) => [formatMoney(value), "Doanh thu"]}
                contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tenant Status Pie Chart */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Cơ Cấu Trạng Thái Tenant
        </h3>
        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [`${value} tổ chức`, "Số lượng"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-around text-xs">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300">{item.name}:</span>
              <strong className="font-bold">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PendingApprovalList({ list }: { list: any[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Yêu Cầu Thuê Bao Chờ Xét Duyệt ({list.length})
          </h3>
        </div>
        <Link
          href="/admin/subscriptions"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {list.length > 0 ? (
          list.slice(0, 5).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {item.tenant?.name || item.account?.full_name}
                </p>
                <p className="text-[11px] text-slate-400">
                  Gói: <span className="font-medium text-slate-600 dark:text-slate-300">{item.plan?.name}</span> • Gửi ngày: {item.created_at.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge type="subscription" status={item.status} />
                <Link
                  href={`/admin/subscriptions/${item.id}`}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-xs text-slate-400">Không có yêu cầu nào chờ duyệt.</p>
        )}
      </div>
    </div>
  );
}

export function ExpiringTenantTable({ list }: { list: any[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4" />
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Tenant Sắp Hết Hạn Thuê Bao (Trong vòng 7 ngày)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase">
            <tr>
              <th className="py-2 px-3">Tên Khách Hàng</th>
              <th className="py-2 px-3">Gói Thuê Bao</th>
              <th className="py-2 px-3">Ngày Hết Hạn</th>
              <th className="py-2 px-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map((t) => (
              <tr key={t.id}>
                <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{t.name}</td>
                <td className="py-2.5 px-3">{t.subscription?.plan?.name || "Standard"}</td>
                <td className="py-2.5 px-3 font-medium text-amber-600 dark:text-amber-400">
                  {t.subscription?.end_date?.slice(0, 10) || "2026-10-16"}
                </td>
                <td className="py-2.5 px-3">
                  <Link
                    href={`/admin/tenants/${t.id}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Xem chi tiết →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
