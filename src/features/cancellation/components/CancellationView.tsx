"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Reservation, Guest } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { StatusBadge } from "@/components/data/StatusBadge";
import { ReasonDialog } from "@/components/feedback/ReasonDialog";
import { toast } from "sonner";
import {
  Ban,
  Search,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldAlert,
  Percent,
} from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface CancellationViewProps {
  initialReservations: ExtendedReservation[];
}

export function CancellationView({ initialReservations }: CancellationViewProps) {
  const [reservations, setReservations] = useState(initialReservations);
  const [search, setSearch] = useState("");
  const [selectedResId, setSelectedResId] = useState(
    initialReservations.find((r) => r.status === "CONFIRMED" || r.status === "PENDING")?.id ||
      initialReservations[0]?.id ||
      ""
  );

  const [quote, setQuote] = useState<{
    refundAmount: number;
    penaltyAmount: number;
    policyName?: string;
    percentRefund?: number;
    daysBeforeCheckIn?: number;
  } | null>(null);

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationResult, setCancellationResult] = useState<any | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);

  const selectedReservation = reservations.find((r) => r.id === selectedResId);

  async function loadQuote(resId: string) {
    if (!resId) return;
    try {
      setIsLoadingQuote(true);
      const q = await api.getCancellationQuote(resId);
      setQuote(q);
      setCancellationResult(null);
    } catch (err: any) {
      toast.error(err.message || "Không thể tính báo giá hoàn tiền khi hủy");
    } finally {
      setIsLoadingQuote(false);
    }
  }

  useEffect(() => {
    if (selectedResId) {
      loadQuote(selectedResId);
    }
  }, [selectedResId]);

  async function handleConfirmCancel(reason: string) {
    if (!selectedResId) return;
    try {
      setIsCancelling(true);
      const res = await api.cancelReservation(selectedResId, reason);
      toast.success(
        `Đã hủy đặt phòng ${selectedReservation?.code || selectedResId}. Phòng đã được giải phóng trở lại kho!`
      );
      setCancellationResult(res);
      setShowCancelDialog(false);

      // Refresh list
      const updatedList = await api.searchReservations();
      setReservations(updatedList as any);
    } catch (err: any) {
      toast.error(err.message || "Không thể hủy đặt phòng");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleSendNotification() {
    if (!selectedResId || !selectedReservation) return;
    try {
      setIsNotifying(true);
      await api.sendNotification(
        selectedResId,
        "CANCELLATION",
        `Đơn đặt phòng ${selectedReservation.code} đã được hủy thành công. Mức hoàn tiền: ${quote?.refundAmount?.toLocaleString("vi-VN") || 0} đ.`
      );
      toast.success(`Đã gửi thông báo xác nhận hủy phòng đến khách hàng!`);
    } catch (err: any) {
      toast.error(err.message || "Gửi thông báo thất bại");
    } finally {
      setIsNotifying(false);
    }
  }

  const filteredReservations = reservations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.guest?.full_name?.toLowerCase().includes(q) ||
      r.guest?.phone?.includes(q)
    );
  });

  const canCancel =
    selectedReservation &&
    (selectedReservation.status === "CONFIRMED" || selectedReservation.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Ban className="w-6 h-6 text-rose-500" />
          Hủy Đặt phòng & Báo giá Hoàn tiền
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Tra cứu đơn đặt phòng, tự động tính toán mức hoàn/phạt theo Policy, giải phóng phòng và lập phiếu hoàn tiền
        </p>
      </div>

      {/* Reservation Picker */}
      <div className="p-4 bg-card border rounded-xl shadow-sm space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Chọn đơn đặt phòng cần xử lý hủy
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đặt phòng, tên hoặc SĐT khách..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <select
            value={selectedResId}
            onChange={(e) => setSelectedResId(e.target.value)}
            className="px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-medium"
          >
            {filteredReservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.guest?.full_name || "Khách lẻ"} ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reservation & Quote Display */}
      {selectedReservation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservation Info Card */}
          <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-foreground">
                {selectedReservation.code}
              </span>
              <StatusBadge status={selectedReservation.status} type="reservation" />
            </div>

            <div className="text-xs space-y-2 border-t pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Khách hàng:</span>
                <strong className="text-foreground">
                  {selectedReservation.guest?.full_name || "Khách lẻ"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="text-foreground">
                  {selectedReservation.guest?.phone || "Chưa có"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày nhận phòng:</span>
                <span className="font-medium text-foreground">
                  <DateText date={selectedReservation.check_in_date} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày trả phòng:</span>
                <span className="font-medium text-foreground">
                  <DateText date={selectedReservation.check_out_date} />
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Tổng tiền đặt phòng:</span>
                <span className="font-bold text-foreground">
                  <MoneyText amount={selectedReservation.total_amount} />
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Tiền cọc đã thanh toán:</span>
                <span className="font-bold">
                  <MoneyText amount={selectedReservation.deposit_amount} />
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Quote Card */}
          <div className="lg:col-span-2 p-5 rounded-2xl border bg-card shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                Báo giá Hoàn tiền theo Chính sách Khách sạn
              </h3>
              {isLoadingQuote && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Đang tính toán...
                </span>
              )}
            </div>

            {quote ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Số tiền dự kiến hoàn trả khách:
                    </span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      <MoneyText amount={quote.refundAmount} />
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Tự động tạo lệnh Refund trạng thái PENDING
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                      Phí phạt hủy / Giữ lại:
                    </span>
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      <MoneyText amount={quote.penaltyAmount} />
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Khấu trừ từ tiền cọc theo quy định
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border text-xs text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground">
                    Cơ sở tính toán:
                  </div>
                  <div>
                    • Áp dụng chính sách: <strong>{quote.policyName || "Chính sách hủy bậc thang"}</strong>
                  </div>
                  <div>
                    • Tỷ lệ hoàn cọc: <strong>{quote.percentRefund !== undefined ? `${quote.percentRefund}%` : "Theo quy định"}</strong>
                  </div>
                  <div>
                    • Khi xác nhận hủy: Hệ thống sẽ chuyển trạng thái đơn sang <strong>CANCELLED</strong> và giải phóng toàn bộ phòng về trạng thái Sẵn sàng bán (READY).
                  </div>
                </div>

                {/* Cancel Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    {!canCancel && (
                      <span className="text-rose-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Chỉ có thể hủy đơn đặt phòng ở trạng thái CONFIRMED hoặc PENDING.
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!canCancel || isCancelling}
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 transition-colors shadow-sm"
                  >
                    <Ban className="w-4 h-4" />
                    Xác nhận Hủy Đặt phòng
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Chọn đơn đặt phòng để xem báo giá hoàn tiền hủy phòng.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Result Banner */}
      {cancellationResult && (
        <div className="p-5 rounded-2xl bg-card border border-emerald-500/30 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-foreground text-sm">
                  Đã hủy đặt phòng thành công!
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Đơn {selectedReservation?.code} đã được cập nhật sang trạng thái CANCELLED. Các phòng đã được giải phóng.
                  {cancellationResult.refund && (
                    <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Phiếu hoàn tiền {cancellationResult.refund.id} ({cancellationResult.refund.amount.toLocaleString("vi-VN")} đ) đã được tạo ở trạng thái PENDING.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isNotifying}
                onClick={handleSendNotification}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Bell className="w-3.5 h-3.5" />
                {isNotifying ? "Đang gửi..." : "Gửi thông báo cho khách"}
              </button>

              <Link
                href="/pms/refunds"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
              >
                Xem mục Hoàn tiền
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Reason Dialog */}
      <ReasonDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
        title={`Xác nhận hủy đặt phòng ${selectedReservation?.code}`}
        description="Thao tác này sẽ hủy đặt phòng, tự động tạo phiếu hoàn tiền tương ứng và giải phóng phòng về kho bán. Vui lòng nhập lý do hủy đặt phòng:"
        confirmText={isCancelling ? "Đang xử lý..." : "Xác nhận hủy phòng"}
        variant="destructive"
      />
    </div>
  );
}
