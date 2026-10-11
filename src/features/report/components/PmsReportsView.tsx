"use client";

import React, { useState } from "react";
import { DailyStatistics } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { toast } from "sonner";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  RotateCcw,
  BedDouble,
  DollarSign,
  Utensils,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

interface PmsReportsViewProps {
  initialStats: DailyStatistics[];
}

export function PmsReportsView({ initialStats }: PmsReportsViewProps) {
  const [stats, setStats] = useState(initialStats);
  const [fromDate, setFromDate] = useState("2026-10-01");
  const [toDate, setToDate] = useState("2026-10-14");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function handleFilter() {
    try {
      setIsRefreshing(true);
      const res = await api.listDailyStats({ from: fromDate, to: toDate });
      setStats(res);
    } catch (err: any) {
      toast.error(err.message || "Không thể lọc số liệu báo cáo");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      setApprovingId(id);
      await api.approveReport(id);
      toast.success("Đã phê duyệt và xác nhận báo cáo ngày thành công!");
      handleFilter();
    } catch (err: any) {
      toast.error(err.message || "Không thể phê duyệt báo cáo");
    } finally {
      setApprovingId(null);
    }
  }

  // Calculate totals
  const totalRevenue = stats.reduce(
    (acc, s) => acc + s.expected_room_revenue + s.fnb_revenue,
    0
  );
  const totalOccupied = stats.reduce((acc, s) => acc + s.occupied_rooms, 0);
  const totalCapacity = stats.reduce(
    (acc, s) => acc + s.occupied_rooms + s.available_rooms,
    0
  );
  const avgOccupancy =
    totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Chart data
  const chartData = stats.map((s) => ({
    date: s.stat_date.slice(5),
    revenue: Math.round((s.expected_room_revenue + s.fnb_revenue) / 1000000), // in millions VND
    occupancy:
      s.occupied_rooms + s.available_rooms > 0
        ? Math.round(
            (s.occupied_rooms / (s.occupied_rooms + s.available_rooms)) * 100
          )
        : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Báo cáo Vận hành & Doanh thu Khách sạn
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Phân tích công suất phòng, tổng doanh thu theo kỳ và phê duyệt báo cáo ngày
          </p>
        </div>

        <button
          type="button"
          onClick={handleFilter}
          disabled={isRefreshing}
          className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Làm mới"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Khoảng thời gian:
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleFilter}
            className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Lọc báo cáo
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Tổng doanh thu kỳ lọc
          </span>
          <div className="text-2xl font-black text-foreground">
            <MoneyText amount={totalRevenue} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bao gồm tiền phòng và toàn bộ dịch vụ F&B
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Tỷ lệ lấp đầy bình quân
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {avgOccupancy}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {totalOccupied} đêm phòng có khách trên {totalCapacity} đêm phòng
          </p>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Số ngày đã chốt sổ (Night Audit)
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.filter((s) => s.status === "CONFIRMED").length} / {stats.length} ngày
          </div>
          <p className="text-[11px] text-muted-foreground">
            Dữ liệu đã đóng băng và sẵn sàng nộp cơ quan thuế/chủ sở hữu
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Doanh thu theo ngày (Triệu VND)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-emerald-500" />
            Công suất phòng (%)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3 text-center">Khách</th>
                <th className="px-4 py-3 text-center">Phòng có khách</th>
                <th className="px-4 py-3 text-right">Doanh thu phòng</th>
                <th className="px-4 py-3 text-right">Doanh thu F&B</th>
                <th className="px-4 py-3">Trạng thái chốt</th>
                <th className="px-4 py-3 text-right">Phê duyệt (Owner)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.map((s) => {
                const isConfirmed = s.status === "CONFIRMED";

                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {s.stat_date}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                      {s.total_guests}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {s.occupied_rooms} / {s.occupied_rooms + s.available_rooms}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      <MoneyText amount={s.expected_room_revenue} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      <MoneyText amount={s.fnb_revenue} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Đã chốt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Chờ chốt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isConfirmed ? (
                        <span className="text-xs text-muted-foreground">Đã xác nhận</span>
                      ) : (
                        <button
                          type="button"
                          disabled={approvingId === s.id}
                          onClick={() => handleApprove(s.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {approvingId === s.id ? "Đang lưu..." : "Phê duyệt"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
