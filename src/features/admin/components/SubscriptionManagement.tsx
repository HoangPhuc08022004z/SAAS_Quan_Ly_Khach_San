"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { ReasonDialog } from "@/components/feedback/ReasonDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle, XCircle, ArrowLeft, Shield } from "lucide-react";

export function SubscriptionTable({ initialList }: { initialList: any[] }) {
  const [list] = useState<any[]>(initialList);
  const [currentTab, setCurrentTab] = useState<string>("ALL");

  const filtered = list.filter((item) => {
    if (currentTab === "ALL") return true;
    return item.status === currentTab;
  });

  const columns: Column<any>[] = [
    {
      key: "tenant",
      header: "Tổ chức & Người đăng ký",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">
            {s.tenant?.name || "Tổ chức mới"}
          </div>
          <div className="text-xs text-slate-400">
            {s.account?.full_name} ({s.account?.email})
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Gói đăng ký",
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{s.plan?.name}</span>
          <div className="text-xs text-slate-400">
            <MoneyText amount={s.price} /> / {s.plan?.duration_unit === "MONTH" ? "tháng" : "năm"}
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Ngày gửi yêu cầu",
      sortable: true,
      render: (s) => <DateText date={s.created_at} type="datetime" />,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (s) => <StatusBadge type="subscription" status={s.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <Link
          href={`/admin/subscriptions/${s.id}`}
          className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg"
        >
          Xét duyệt →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        {[
          { id: "ALL", label: "Tất cả yêu cầu" },
          { id: "PENDING", label: "Chờ xét duyệt" },
          { id: "ACTIVE", label: "Đang hoạt động" },
          { id: "EXPIRED", label: "Đã hết hạn" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`pb-3 transition-colors border-b-2 ${
              currentTab === tab.id
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="danh-sach-yeu-cau-thue-bao" />
    </div>
  );
}

export function SubscriptionDetailView({ subscription }: { subscription: any }) {
  const router = useRouter();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sub, setSub] = useState(subscription);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const updated = await api.adminApproveSubscription(sub.id);
      setSub((prev: any) => ({ ...prev, status: updated.status }));
      toast.success("Đã phê duyệt yêu cầu thuê bao! Chủ khách sạn có thể thanh toán để kích hoạt.");
      router.refresh();
    } catch {
      toast.error("Phê duyệt thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setIsLoading(true);
    try {
      const updated = await api.adminRejectSubscription(sub.id, reason);
      setSub((prev: any) => ({ ...prev, status: updated.status }));
      setIsRejectOpen(false);
      toast.success("Đã từ chối yêu cầu thuê bao kèm lý do gửi cho khách hàng.");
      router.refresh();
    } catch {
      toast.error("Không thể từ chối yêu cầu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Action Bar for Pending */}
      {sub.status === "PENDING" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Yêu cầu đang chờ phê duyệt:</strong> Vui lòng kiểm tra kỹ thông tin doanh nghiệp trước khi duyệt.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRejectOpen(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Từ chối</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Phê duyệt yêu cầu</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account & Tenant */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Thông tin Tổ chức & Khách hàng</span>
          </h3>
          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Tên tổ chức:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.tenant?.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Người đại diện:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.account?.full_name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sub.account?.email}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Trạng thái Tenant:</span>
              <StatusBadge type="tenant" status={sub.tenant?.status || "PENDING"} />
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Gói Thuê Bao & Chi Phí
          </h3>
          <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Tên gói:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{sub.plan?.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Giá niêm yết:</span>
              <MoneyText amount={sub.price} className="font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Thời hạn:</span>
              <span>{sub.plan?.duration} {sub.plan?.duration_unit === "MONTH" ? "tháng" : "năm"}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Trạng thái yêu cầu:</span>
              <StatusBadge type="subscription" status={sub.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Lịch Sử Giao Dịch Của Yêu Cầu Này
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase">
              <tr>
                <th className="py-2">Mã giao dịch</th>
                <th className="py-2">Số tiền</th>
                <th className="py-2">Phương thức</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sub.payments && sub.payments.length > 0 ? (
                sub.payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2.5 font-mono">{p.transaction_id}</td>
                    <td className="py-2.5 font-bold"><MoneyText amount={p.amount} /></td>
                    <td className="py-2.5">{p.payment_method}</td>
                    <td className="py-2.5"><StatusBadge type="payment" status={p.status} /></td>
                    <td className="py-2.5"><DateText date={p.created_at} type="datetime" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">Chưa có giao dịch thanh toán nào được tạo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonDialog
        isOpen={isRejectOpen}
        title="Từ chối yêu cầu đăng ký thuê bao"
        description="Vui lòng nhập lý do từ chối cụ thể. Lý do này sẽ được ghi vào nhật ký kiểm toán và hiển thị cho khách hàng."
        onConfirm={handleRejectConfirm}
        onClose={() => setIsRejectOpen(false)}
      />
    </div>
  );
}
