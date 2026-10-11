"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExtFnbRequest, FnbItem, User } from "@/lib/api/types";
import { api } from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ReasonDialog } from "@/components/feedback/ReasonDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import {
  ClipboardCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Utensils,
  User as UserIcon,
} from "lucide-react";

type FullFnbRequest = ExtFnbRequest & { item?: FnbItem; user?: User };

interface FnbApprovalViewProps {
  initialRequests: FullFnbRequest[];
}

export function FnbApprovalView({ initialRequests }: FnbApprovalViewProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApproveId, setSelectedApproveId] = useState<string | null>(null);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshRequests() {
    try {
      setIsRefreshing(true);
      const res = await api.listFnbRequests();
      setRequests(res as any);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách phê duyệt F&B");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleApprove() {
    if (!selectedApproveId) return;
    try {
      await api.approveFnbRequest(selectedApproveId);
      toast.success("Đã phê duyệt yêu cầu F&B thành công!");
      setSelectedApproveId(null);
      refreshRequests();
    } catch (err: any) {
      toast.error(err.message || "Không thể phê duyệt yêu cầu");
    }
  }

  async function handleReject(reason: string) {
    if (!selectedRejectId) return;
    try {
      await api.rejectFnbRequest(selectedRejectId, reason);
      toast.success("Đã từ chối yêu cầu F&B.");
      setSelectedRejectId(null);
      refreshRequests();
    } catch (err: any) {
      toast.error(err.message || "Không thể từ chối yêu cầu");
    }
  }

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pms/fnb/menu"
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-amber-500" />
              Hàng đợi Phê duyệt Yêu cầu F&B
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Xét duyệt các đơn hàng ẩm thực số lượng lớn hoặc đơn đột xuất từ nhân viên
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshRequests}
          disabled={isRefreshing}
          className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Làm mới"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
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
          Tất cả ({requests.length})
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
          Chờ duyệt ({requests.filter((r) => r.status === "PENDING").length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("APPROVED")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "APPROVED"
              ? "bg-emerald-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Đã duyệt ({requests.filter((r) => r.status === "APPROVED").length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("REJECTED")}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === "REJECTED"
              ? "bg-rose-600 text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Đã từ chối ({requests.filter((r) => r.status === "REJECTED").length})
        </button>
      </div>

      {/* Table */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-6 h-6" />}
          title="Không có yêu cầu nào"
          description="Hiện tại không có yêu cầu phê duyệt F&B nào trong danh sách."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Món yêu cầu</th>
                  <th className="px-4 py-3 text-center">Số lượng</th>
                  <th className="px-4 py-3">Người tạo</th>
                  <th className="px-4 py-3">Lý do yêu cầu</th>
                  <th className="px-4 py-3">Thời điểm</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRequests.map((req) => {
                  const isPending = req.status === "PENDING";
                  return (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {req.item?.name || "Món ăn"}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-primary">
                        {req.quantity} phần
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <UserIcon className="w-3.5 h-3.5" />
                          {req.user?.full_name || "Nhân viên"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground max-w-xs break-words">
                        {req.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <DateText date={req.created_at} type="datetime" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {req.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Chờ duyệt
                          </span>
                        )}
                        {req.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Đã từ chối
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedApproveId(req.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRejectId(req.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
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

      {/* Confirm Approve Dialog */}
      <ConfirmDialog
        isOpen={!!selectedApproveId}
        onClose={() => setSelectedApproveId(null)}
        onConfirm={handleApprove}
        title="Xác nhận phê duyệt yêu cầu F&B?"
        description="Bạn có đồng ý phê duyệt đơn đặt món ẩm thực này không? Số lượng sẽ được chuẩn bị và chuyển vào hàng đợi phục vụ."
        confirmText="Xác nhận duyệt"
      />

      {/* Reason Reject Dialog */}
      <ReasonDialog
        isOpen={!!selectedRejectId}
        onClose={() => setSelectedRejectId(null)}
        onConfirm={handleReject}
        title="Từ chối yêu cầu F&B"
        description="Vui lòng nêu rõ lý do từ chối yêu cầu đặt món F&B này:"
        confirmText="Xác nhận từ chối"
      />
    </div>
  );
}
