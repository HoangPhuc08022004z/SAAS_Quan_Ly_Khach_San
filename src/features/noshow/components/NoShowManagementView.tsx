"use client";

import React, { useState } from "react";
import { Reservation, Guest, Room } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import {
  AlertTriangle,
  Clock,
  Bell,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Phone,
  User,
  ShieldAlert,
  Play,
} from "lucide-react";

type NoShowCandidate = Reservation & {
  guest?: Guest;
  rooms?: Room[];
  hoursOverdue?: number;
  candidateAt?: string;
};

interface NoShowManagementViewProps {
  initialCandidates: NoShowCandidate[];
}

export function NoShowManagementView({
  initialCandidates,
}: NoShowManagementViewProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedConfirmId, setSelectedConfirmId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRunningJob, setIsRunningJob] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<Record<string, boolean>>({});

  async function refreshCandidates() {
    try {
      setIsRefreshing(true);
      const res = await api.listNoShowCandidates();
      setCandidates(res as any);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách ứng viên No-Show");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleRunDetectJob() {
    try {
      setIsRunningJob(true);
      const res = await api.runNoShowDetectJob();
      toast.success(
        `Tác vụ hoàn tất! Nhật ký tác vụ: ${res.status}. Đã cập nhật các ứng viên quá hạn nhận phòng.`
      );
      refreshCandidates();
    } catch (err: any) {
      toast.error(err.message || "Chạy tác vụ phát hiện No-Show thất bại");
    } finally {
      setIsRunningJob(false);
    }
  }

  async function handleSendNotice(candidate: NoShowCandidate) {
    try {
      await api.sendNotification(
        candidate.id,
        "NO_SHOW_WARNING",
        `Quý khách có đơn đặt phòng ${candidate.code} tại Khách sạn ABC đã quá giờ Check-in tiêu chuẩn. Vui lòng phản hồi trước 12 tiếng nếu quý khách đến muộn.`
      );
      setNotifiedIds((prev) => ({ ...prev, [candidate.id]: true }));
      toast.success(`Đã gửi tin nhắn thông báo No-Show đến khách hàng ${candidate.guest?.full_name || ""}`);
    } catch (err: any) {
      toast.error(err.message || "Gửi thông báo thất bại");
    }
  }

  async function handleConfirmNoShow() {
    if (!selectedConfirmId) return;
    try {
      await api.confirmNoShow(selectedConfirmId, { keepFirstNight: true });
      toast.success(
        "Đã xác nhận No-Show thành công! Tiền cọc đã được xử lý theo Policy và phòng đã được trả về trạng thái mở bán."
      );
      setSelectedConfirmId(null);
      refreshCandidates();
    } catch (err: any) {
      toast.error(err.message || "Xác nhận No-Show thất bại");
    }
  }

  const selectedCandidate = candidates.find((c) => c.id === selectedConfirmId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Xử lý Khách không đến (No-Show)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý các đơn đặt phòng quá hạn Check-in tiêu chuẩn, đếm ngược phản hồi và xử lý tiền cọc theo Policy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshCandidates}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            disabled={isRunningJob}
            onClick={handleRunDetectJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningJob ? "animate-spin" : ""}`} />
            {isRunningJob ? "Đang quét..." : "Quét tự động No-Show"}
          </button>
        </div>
      </div>

      {/* Policy Notice Box */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Quy trình xử lý No-Show chuẩn (BR-OP-38 đến 43):</span>
          <div className="mt-1 space-y-0.5 text-muted-foreground">
            <div>1. Quá giờ Check-in tiêu chuẩn (14:00) đặt phòng được hệ thống đánh dấu là Ứng viên No-Show.</div>
            <div>2. Lễ tân gửi thông báo đến khách, thời gian chờ phản hồi mặc định là 12 giờ.</div>
            <div>3. Sau thời gian chờ nếu khách không phản hồi, Quản lý (Manager) xác nhận No-Show. Hệ thống sẽ giữ cọc đêm đầu theo chính sách và giải phóng phòng về trạng thái bán.</div>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      {candidates.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          title="Không có ứng viên No-Show nào"
          description="Tất cả các đặt phòng trong ngày đều đã Check-in hoặc chưa vượt quá mốc giờ quy định."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng & SĐT</th>
                  <th className="px-4 py-3">Ngày nhận phòng</th>
                  <th className="px-4 py-3 text-center">Quá hạn</th>
                  <th className="px-4 py-3 text-right">Tiền cọc</th>
                  <th className="px-4 py-3">Thời gian phản hồi</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {candidates.map((c) => {
                  const hasNotified = notifiedIds[c.id];

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {c.code}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        <div className="font-semibold">{c.guest?.full_name || "Khách lẻ"}</div>
                        <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {c.guest?.phone || "Chưa cập nhật"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <DateText date={c.check_in_date} />
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <Clock className="w-3 h-3" />
                          Quá {c.hoursOverdue || 4} giờ
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        <MoneyText amount={c.deposit_amount} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {hasNotified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã gửi tin nhắn (còn 11h)
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Chưa gửi thông báo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendNotice(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
                          >
                            <Bell className="w-3 h-3 text-amber-500" />
                            {hasNotified ? "Gửi lại" : "Nhắc khách"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedConfirmId(c.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                          >
                            Xác nhận No-Show
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm No-Show Dialog */}
      <ConfirmDialog
        isOpen={!!selectedConfirmId}
        onClose={() => setSelectedConfirmId(null)}
        onConfirm={handleConfirmNoShow}
        title={`Xác nhận No-Show cho đơn ${selectedCandidate?.code}`}
        description={`Bạn có chắc chắn muốn xác nhận khách không đến cho đơn ${selectedCandidate?.code}? Hệ thống sẽ giải phóng phòng trả về trạng thái Sẵn sàng bán (READY), tiền cọc (${selectedCandidate?.deposit_amount.toLocaleString("vi-VN")} đ) sẽ được giữ lại theo Chính sách No-Show của khách sạn.`}
        confirmText="Xác nhận No-Show & Giải phóng phòng"
        variant="destructive"
      />
    </div>
  );
}
