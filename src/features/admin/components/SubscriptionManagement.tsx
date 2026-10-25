"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { approveSubscription, rejectSubscription } from "@/lib/api";
import type { PendingSubscription } from "@/lib/api/types/openapi.interface";
import { toast } from "sonner";
import { CheckCircle, XCircle, Shield } from "lucide-react";

// Backend chỉ có API liệt kê yêu cầu đang chờ duyệt (PENDING_APPROVAL / PENDING)
export function SubscriptionTable({ initialList }: { initialList: PendingSubscription[] }) {
  const columns: Column<PendingSubscription>[] = [
    {
      key: "tenantName",
      header: "Tổ chức & Người đăng ký",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{s.tenantName}</div>
          <div className="text-xs text-slate-400">{s.email}</div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Gói đăng ký",
      render: (s) => <span className="font-semibold text-slate-800 dark:text-slate-200">{s.plan}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: () => <StatusBadge type="subscription" status="PENDING_APPROVAL" />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <Link
          href={`/admin/subscriptions/${s.subscriptionId}`}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
        >
          Xét duyệt →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Danh sách yêu cầu đang chờ duyệt ({initialList.length}). Các yêu cầu đã xử lý sẽ không còn hiển thị tại đây.
      </p>
      <DataTable columns={columns} data={initialList} exportFileName="danh-sach-yeu-cau-thue-bao" />
    </div>
  );
}

export function SubscriptionDetailView({ subscription }: { subscription: PendingSubscription }) {
  const router = useRouter();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // Gọi OpenAPI: POST /api/admin/subscriptions/{subscriptionId}/approve
      const res = await approveSubscription(subscription.subscriptionId);
      toast.success(res?.message || "Đã phê duyệt. Link thanh toán đã được gửi cho chủ khách sạn.");
      router.push("/admin/subscriptions");
    } catch (err: any) {
      toast.error(err?.message || "Phê duyệt thất bại.");
      setIsLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    setIsLoading(true);
    try {
      // Gọi OpenAPI: POST /api/admin/subscriptions/{subscriptionId}/reject
      const res = await rejectSubscription(subscription.subscriptionId);
      toast.success(res?.message || "Đã từ chối yêu cầu thuê bao.");
      router.push("/admin/subscriptions");
    } catch (err: any) {
      toast.error(err?.message || "Không thể từ chối yêu cầu.");
      setIsLoading(false);
      setIsRejectOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Yêu cầu đang chờ phê duyệt:</strong> Sau khi duyệt, hệ thống tạo link Stripe và gửi email cho chủ khách sạn.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRejectOpen(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Từ chối</span>
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isLoading ? "Đang xử lý..." : "Phê duyệt yêu cầu"}</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" />
          <span>Thông tin Tổ chức & Gói đăng ký</span>
        </h3>
        <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
          <div className="pt-2 flex justify-between gap-4">
            <span className="text-slate-400">Tên tổ chức:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{subscription.tenantName}</span>
          </div>
          <div className="pt-2 flex justify-between gap-4">
            <span className="text-slate-400">Mô tả:</span>
            <span className="text-slate-800 dark:text-slate-200 text-right">{subscription.tenantDescription || "—"}</span>
          </div>
          <div className="pt-2 flex justify-between gap-4">
            <span className="text-slate-400">Email chủ khách sạn:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{subscription.email}</span>
          </div>
          <div className="pt-2 flex justify-between gap-4">
            <span className="text-slate-400">Gói yêu cầu:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{subscription.plan}</span>
          </div>
          <div className="pt-2 flex justify-between gap-4">
            <span className="text-slate-400">Trạng thái yêu cầu:</span>
            <StatusBadge type="subscription" status="PENDING_APPROVAL" />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRejectOpen}
        title="Từ chối yêu cầu đăng ký thuê bao"
        description="Hệ thống sẽ chuyển yêu cầu sang trạng thái REJECTED và gửi email thông báo. Chủ khách sạn có thể gửi lại yêu cầu."
        confirmText="Từ chối yêu cầu"
        variant="destructive"
        isLoading={isLoading}
        onConfirm={handleRejectConfirm}
        onClose={() => setIsRejectOpen(false)}
      />
    </div>
  );
}
