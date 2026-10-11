"use client";

import React, { useState } from "react";
import { DailyStatistics } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { AdjustStatsDialog } from "./AdjustStatsDialog";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "sonner";
import {
  Moon,
  Calendar,
  CheckCircle2,
  Lock,
  Edit3,
  RotateCcw,
  Users,
  BedDouble,
  DollarSign,
  Utensils,
  Play,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface NightAuditViewProps {
  initialStats: DailyStatistics[];
}

export function NightAuditView({ initialStats }: NightAuditViewProps) {
  const [statsList, setStatsList] = useState(initialStats);
  const [selectedDate, setSelectedDate] = useState(
    initialStats[0]?.stat_date || "2026-10-11"
  );
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [showConfirmAudit, setShowConfirmAudit] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRunningJob, setIsRunningJob] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentStats = statsList.find((s) => s.stat_date === selectedDate) || statsList[0];

  async function refreshStats() {
    try {
      setIsRefreshing(true);
      const res = await api.listDailyStats();
      setStatsList(res);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lại số liệu thống kê");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRunDailyJob() {
    try {
      setIsRunningJob(true);
      await api.runDailyStatsJob(selectedDate);
      toast.success(`Đã tổng hợp số liệu thống kê tự động cho ngày ${selectedDate}!`);
      refreshStats();
    } catch (err: any) {
      toast.error(err.message || "Tác vụ chạy thống kê thất bại");
    } finally {
      setIsRunningJob(false);
    }
  }

  async function handleConfirmAudit() {
    if (!currentStats) return;
    try {
      setIsConfirming(true);
      await api.confirmDailyStats(currentStats.id);
      toast.success(`Đã chốt sổ thành công số liệu ngày ${currentStats.stat_date}!`);
      setShowConfirmAudit(false);
      refreshStats();
    } catch (err: any) {
      toast.error(err.message || "Không thể chốt số liệu");
    } finally {
      setIsConfirming(false);
    }
  }

  const isConfirmed = currentStats?.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-500" />
            Kiểm toán Đêm & Chốt ngày (Night Audit)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Đối soát số liệu lưu trú, doanh thu phòng, F&B, kiểm tra No-Show và khóa sổ kế toán ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshStats}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            disabled={isRunningJob}
            onClick={handleRunDailyJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningJob ? "animate-spin" : ""}`} />
            {isRunningJob ? "Đang chạy..." : "Tổng hợp lại số liệu"}
          </button>
        </div>
      </div>

      {/* Date Selector and Audit Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Ngày kiểm toán
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-bold bg-transparent border-none focus:outline-none cursor-pointer text-foreground"
            >
              {statsList.map((s) => (
                <option key={s.id} value={s.stat_date}>
                  {s.stat_date} ({s.status === "CONFIRMED" ? "Đã chốt" : "Chờ xác nhận"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Trạng thái chốt sổ:</span>
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> Đã chốt số liệu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" /> Chờ xác nhận
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Điều chỉnh số liệu
            </button>

            {!isConfirmed && (
              <button
                type="button"
                onClick={() => setShowConfirmAudit(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Chốt sổ ngày
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lock Notice if confirmed */}
      {isConfirmed && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Số liệu ngày {currentStats.stat_date} đã được chốt chính thức (Audit Locked):</span>
            <div className="mt-0.5 text-muted-foreground">
              Toàn bộ chỉ số doanh thu và buồng phòng của ngày đã được đóng băng. Mọi thay đổi tiếp theo bắt buộc phải qua quy trình điều chỉnh kiểm toán (Audit Adjustment) kèm lý do giải trình.
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {currentStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Guest and Room Count */}
          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Tổng số khách</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {currentStats.total_guests} khách
            </div>
            <p className="text-[11px] text-muted-foreground">
              Đang lưu trú trong khách sạn
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Phòng có khách / Trống</span>
              <BedDouble className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {currentStats.occupied_rooms} / {currentStats.available_rooms}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Công suất phòng:{" "}
              {currentStats.available_rooms + currentStats.occupied_rooms > 0
                ? Math.round(
                    (currentStats.occupied_rooms /
                      (currentStats.available_rooms + currentStats.occupied_rooms)) *
                      100
                  )
                : 0}
              %
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Đặt phòng thành công</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {currentStats.successful_reservations} đơn
            </div>
            <p className="text-[11px] text-muted-foreground">
              No-Show: {currentStats.noshow_count} | Hủy: {currentStats.cancelled_count}
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Tiền cọc đã thu</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <MoneyText amount={currentStats.deposit_collected} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hoàn tiền: {currentStats.refund_count} giao dịch
            </p>
          </div>

          {/* Revenue and F&B */}
          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Doanh thu phòng dự kiến</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              <MoneyText amount={currentStats.expected_room_revenue} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Căn cứ theo giá phòng và hợp đồng lưu trú thực tế trong ngày
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-card shadow-sm space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Ẩm thực (F&B): Doanh thu & Chi phí</span>
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-muted-foreground block">Doanh thu:</span>
                <span className="text-lg font-bold text-foreground">
                  <MoneyText amount={currentStats.fnb_revenue} />
                </span>
              </div>
              <div className="border-l pl-4">
                <span className="text-xs text-muted-foreground block">Chi phí vốn:</span>
                <span className="text-lg font-bold text-rose-500">
                  <MoneyText amount={currentStats.fnb_cost} />
                </span>
              </div>
              <div className="border-l pl-4">
                <span className="text-xs text-muted-foreground block">Lợi nhuận gộp:</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  <MoneyText amount={Math.max(0, currentStats.fnb_revenue - currentStats.fnb_cost)} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Dialog */}
      {currentStats && (
        <AdjustStatsDialog
          stats={currentStats}
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          onSuccess={refreshStats}
        />
      )}

      {/* Confirm Audit Dialog */}
      <ConfirmDialog
        isOpen={showConfirmAudit}
        onClose={() => setShowConfirmAudit(false)}
        onConfirm={handleConfirmAudit}
        title={`Chốt sổ Night Audit cho ngày ${currentStats?.stat_date}?`}
        description="Thao tác chốt số liệu sẽ khóa toàn bộ báo cáo doanh thu và buồng phòng của ngày hôm nay. Bạn có chắc chắn muốn hoàn tất chốt sổ kế toán không?"
        confirmText={isConfirming ? "Đang chốt sổ..." : "Xác nhận chốt sổ"}
      />
    </div>
  );
}
