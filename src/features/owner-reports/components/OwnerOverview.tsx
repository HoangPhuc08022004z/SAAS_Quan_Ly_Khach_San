"use client";

import React from "react";
import Link from "next/link";
import { MoneyText } from "@/components/data/MoneyText";
import {
  Hotel,
  TrendingUp,
  DollarSign,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  PieChart,
} from "lucide-react";

export function OwnerOverview({ data }: { data: any }) {
  const { todayRevenue, occupancyRate, properties } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Doanh thu hôm nay (Toàn chuỗi)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <MoneyText amount={todayRevenue} className="text-2xl font-black text-slate-900 dark:text-white" />
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4% so với tuần trước</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Công suất phòng trung bình</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{occupancyRate}%</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Mức lấp đầy ổn định</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Số cơ sở khách sạn</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Hotel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{properties.length} cơ sở</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đang vận hành thực tế</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Báo cáo ngày chờ duyệt</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              {properties.reduce((sum: number, p: any) => sum + (p.unconfirmedReports || 0), 0)} bản
            </div>
            <Link
              href="/owner/reports"
              className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
            >
              <span>Xem và xác nhận</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Property Comparison Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hiệu Suất Vận Hành Từng Khách Sạn
            </h3>
            <p className="text-xs text-slate-400">Đối chiếu tỷ lệ công suất phòng và doanh thu ghi nhận trong ngày</p>
          </div>
          <Link
            href="/owner/reports"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Toàn bộ báo cáo Night Audit</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tên khách sạn</th>
                <th className="py-3 px-4">Địa chỉ</th>
                <th className="py-3 px-4 text-center">Công suất phòng</th>
                <th className="py-3 px-4 text-right">Doanh thu hôm nay</th>
                <th className="py-3 px-4 text-center">Báo cáo ngày</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {properties.map((item: any) => (
                <tr key={item.property.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {item.property.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {item.property.address}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-blue-600">{item.occupancy}%</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <MoneyText amount={item.revenue} className="font-bold text-slate-900 dark:text-white" />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.unconfirmedReports > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Chờ xác nhận
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Đã chốt
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/owner/properties/${item.property.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Chi tiết →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
