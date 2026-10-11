"use client";

import React, { useState } from "react";
import { Refund, Reservation } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  Send,
  CreditCard,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface RefundManagementViewProps {
  initialRefunds: Refund[];
  reservations: Reservation[];
}

export function RefundManagementView({
  initialRefunds,
  reservations,
}: RefundManagementViewProps) {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedExecuteId, setSelectedExecuteId] = useState<string | null>(null);
  const [selectedStatusEdit, setSelectedStatusEdit] = useState<{ id: string; status: Refund["status"] } | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual refund form state
  const [manualResId, setManualResId] = useState(reservations[0]?.id || "");
  const [manualAmount, setManualAmount] = useState(200000);
  const [manualReason, setManualReason] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  async function refreshRefunds() {
    try {
      setIsRefreshing(true);
      const res = await api.listRefunds();
      setRefunds(res);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lại danh sách hoàn tiền");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleExecuteRefund() {
    if (!selectedExecuteId) return;
    try {
      await api.executeRefund(selectedExecuteId);
      toast.success("Đã thực hiện hoàn tiền qua Cổng thanh toán thành công!");
      setSelectedExecuteId(null);
      refreshRefunds();
    } catch (err: any) {
      toast.error(err.message || "Không thể thực hiện hoàn tiền");
    }
  }

  async function handleUpdateStatus() {
    if (!selectedStatusEdit) return;
    try {
      await api.setRefundStatus(selectedStatusEdit.id, selectedStatusEdit.status);
      toast.success("Đã cập nhật trạng thái hoàn tiền!");
      setSelectedStatusEdit(null);
      refreshRefunds();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái");
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualResId) {
      toast.error("Vui lòng chọn đặt phòng");
      return;
    }
    if (manualAmount <= 0) {
      toast.error("Số tiền hoàn phải lớn hơn 0");
      return;
    }
    if (!manualReason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    try {
      setIsSubmittingManual(true);
      await api.createRefundRequest(manualResId, {
        amount: manualAmount,
        reason: manualReason.trim(),
      });
      toast.success("Đã tạo yêu cầu hoàn tiền mới thành công!");
      setIsManualModalOpen(false);
      setManualReason("");
      refreshRefunds();
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo yêu cầu hoàn tiền");
    } finally {
      setIsSubmittingManual(false);
    }
  }

  const filteredRefunds = refunds.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-primary" />
            Quản lý Hoàn tiền (Refunds)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi, xử lý và đối soát các giao dịch hoàn trả tiền cọc hoặc bồi hoàn cho khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshRefunds}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tạo yêu cầu hoàn tiền
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-3 bg-card border rounded-xl shadow-sm">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "ALL"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Tất cả ({refunds.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("PENDING")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "PENDING"
              ? "bg-amber-500 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Chờ xử lý ({refunds.filter((r) => r.status === "PENDING").length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("SUCCESS")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "SUCCESS"
              ? "bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Đã hoàn thành ({refunds.filter((r) => r.status === "SUCCESS").length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("FAILED")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "FAILED"
              ? "bg-rose-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Thất bại ({refunds.filter((r) => r.status === "FAILED").length})
        </button>
      </div>

      {/* Refunds Table */}
      {filteredRefunds.length === 0 ? (
        <EmptyState
          icon={<RotateCcw className="w-6 h-6" />}
          title="Không có bản ghi hoàn tiền nào"
          description="Hiện tại không có khoản hoàn tiền nào khớp với bộ lọc."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Mã phiếu</th>
                  <th className="px-4 py-3">Mã đặt phòng</th>
                  <th className="px-4 py-3">Giao dịch gốc</th>
                  <th className="px-4 py-3 text-right">Số tiền hoàn</th>
                  <th className="px-4 py-3">Lý do hoàn tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thời điểm</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRefunds.map((rf) => {
                  const res = reservations.find((r) => r.id === rf.reservation_id);
                  const isPending = rf.status === "PENDING";
                  const isFailed = rf.status === "FAILED";

                  return (
                    <tr key={rf.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-foreground">
                        {rf.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {res?.code || rf.reservation_id}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {rf.payment_id}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-rose-600 dark:text-rose-400">
                        <MoneyText amount={rf.amount} />
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground max-w-xs break-words">
                        {rf.reason}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {rf.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Chờ xử lý
                          </span>
                        )}
                        {rf.status === "SUCCESS" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Thành công
                          </span>
                        )}
                        {rf.status === "FAILED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Thất bại
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <DateText date={rf.created_at} type="datetime" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setSelectedExecuteId(rf.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Hoàn tiền ngay
                          </button>
                        )}
                        {isFailed && (
                          <button
                            type="button"
                            onClick={() => {
                              setManualResId(rf.reservation_id);
                              setManualAmount(rf.amount);
                              setManualReason(`Thử lại hoàn tiền cho yêu cầu ${rf.id}: ${rf.reason}`);
                              setIsManualModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Tạo lại yêu cầu
                          </button>
                        )}
                        {rf.status === "SUCCESS" && (
                          <span className="text-xs text-muted-foreground font-medium">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Execute Dialog */}
      <ConfirmDialog
        isOpen={!!selectedExecuteId}
        onClose={() => setSelectedExecuteId(null)}
        onConfirm={handleExecuteRefund}
        title="Thực hiện hoàn tiền qua Cổng thanh toán?"
        description="Số tiền sẽ được chuyển trả về tài khoản hoặc ví gốc của khách hàng qua Payment Gateway. Thao tác này không thể hoàn tác."
        confirmText="Xác nhận hoàn tiền"
      />

      {/* Manual Refund Form Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden p-5">
            <h3 className="font-semibold text-foreground text-base mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Lập phiếu hoàn tiền thủ công
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Đặt phòng cần hoàn tiền <span className="text-rose-500">*</span>
                </label>
                <select
                  value={manualResId}
                  onChange={(e) => setManualResId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                >
                  {reservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} ({r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Số tiền hoàn (VND) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  step={10000}
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Lý do hoàn tiền <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="VD: Khách trả phòng sớm, hoàn tiền cọc thừa..."
                  className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  disabled={isSubmittingManual}
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmittingManual ? "Đang tạo..." : "Tạo yêu cầu hoàn tiền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
