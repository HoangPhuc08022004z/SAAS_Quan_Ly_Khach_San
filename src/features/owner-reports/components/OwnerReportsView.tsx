"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  FileCheck2,
  CheckCircle2,
  ExternalLink,
  X,
  Building,
  TrendingUp,
  Bed,
  Users,
} from "lucide-react";

export function OwnerReportsView({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState<any[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const filtered = reports.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  const handleApprove = async (reportId: string) => {
    setIsApproving(true);
    try {
      await api.approveReport(reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: "CONFIRMED" } : r))
      );
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev: any) => ({ ...prev, status: "CONFIRMED" }));
      }
      toast.success("Đã phê duyệt và xác nhận báo cáo doanh thu thành công!");
    } catch {
      toast.error("Không thể xác nhận báo cáo.");
    } finally {
      setIsApproving(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "date",
      header: "Ngày chốt số liệu",
      sortable: true,
      render: (r) => (
        <div className="font-bold text-xs text-slate-900 dark:text-white">
          <DateText date={r.date} />
        </div>
      ),
    },
    {
      key: "property_id",
      header: "Mã cơ sở",
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.property_id}</span>,
    },
    {
      key: "occupancy_rate",
      header: "Công suất phòng",
      sortable: true,
      render: (r) => (
        <span className="font-bold text-xs text-blue-600">
          {r.occupancy_rate || Math.round(((r.occupied_rooms || 15) / 22) * 100)}%
        </span>
      ),
    },
    {
      key: "expected_room_revenue",
      header: "Doanh thu phòng",
      sortable: true,
      render: (r) => <MoneyText amount={r.expected_room_revenue} className="text-xs font-semibold" />,
    },
    {
      key: "fnb_revenue",
      header: "Doanh thu F&B",
      sortable: true,
      render: (r) => <MoneyText amount={r.fnb_revenue} className="text-xs font-semibold text-amber-600" />,
    },
    {
      key: "status",
      header: "Trạng thái chốt",
      render: (r) => <StatusBadge type="daily_statistics" status={r.status} />,
    },
    {
      key: "actions",
      header: "Chi tiết",
      render: (r) => (
        <button
          onClick={() => setSelectedReport(r)}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>Xem chi tiết</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CONFIRMED">Đã chốt (CONFIRMED)</option>
          <option value="UNCONFIRMED">Chờ xác nhận (UNCONFIRMED)</option>
          <option value="ADJUSTED">Có điều chỉnh (ADJUSTED)</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="bao-cao-doanh-thu-owner" />

      {/* Report Detail Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Báo Cáo Ngày: {selectedReport.date}
                    </h3>
                    <p className="text-[11px] text-slate-400">Cơ sở: {selectedReport.property_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Trạng thái:</span>
                <StatusBadge type="daily_statistics" status={selectedReport.status} />
              </div>

              {/* Key Indicators */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-400">Phòng có khách</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedReport.occupied_rooms} phòng
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-400">Tổng khách lưu trú</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedReport.total_guests} khách
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-400">Đơn thành công</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedReport.successful_bookings} đơn
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-[11px] text-slate-400">Khách vắng mặt (No-Show)</span>
                  <div className="font-bold text-rose-600 mt-0.5">{selectedReport.no_show_count} lượt</div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Tổng hợp doanh thu & chi phí:</h4>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Doanh thu phòng dự kiến:</span>
                  <MoneyText amount={selectedReport.expected_room_revenue} className="font-semibold text-slate-900 dark:text-white" />
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Doanh thu ẩm thực F&B:</span>
                  <MoneyText amount={selectedReport.fnb_revenue} className="font-semibold text-slate-900 dark:text-white" />
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Chi phí nguyên liệu F&B:</span>
                  <MoneyText amount={selectedReport.fnb_cost} className="font-semibold text-rose-600" />
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tiền cọc đã thu:</span>
                  <MoneyText amount={selectedReport.deposit_collected} className="font-semibold text-blue-600" />
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Tiền hoàn trả khách (Refund):</span>
                  <MoneyText amount={selectedReport.refund_amount} className="font-semibold text-slate-600" />
                </div>
              </div>

              {selectedReport.adjustment_reason && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold">Lý do điều chỉnh số liệu:</span>
                  <p>{selectedReport.adjustment_reason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              {selectedReport.status !== "CONFIRMED" && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedReport.id)}
                  disabled={isApproving}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isApproving ? "Đang xác nhận..." : "Xác nhận báo cáo (Owner)"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
