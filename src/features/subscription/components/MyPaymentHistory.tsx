"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { CreditCard, ExternalLink, X } from "lucide-react";

export function MyPaymentHistory({ initialPayments }: { initialPayments: any[] }) {
  const [payments] = useState<any[]>(initialPayments);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const filtered = payments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = p.id.toLowerCase().includes(q);
      const matchRef = (p.transaction_ref || "").toLowerCase().includes(q);
      if (!matchId && !matchRef) return false;
    }
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Mã giao dịch",
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-mono font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>{p.id}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Ref: {p.transaction_ref || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      sortable: true,
      render: (p) => <MoneyText amount={p.amount} className="font-bold text-slate-900 dark:text-white text-xs" />,
    },
    {
      key: "gateway",
      header: "Cổng & Phương thức",
      render: (p) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{p.payment_gateway || p.gateway || "MOMO"}</span>
          <div className="text-[11px] text-slate-400 capitalize">{p.payment_method?.toLowerCase() || "QR"}</div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Thời điểm tạo",
      sortable: true,
      render: (p) => <DateText date={p.created_at} type="datetime" className="text-xs text-slate-500" />,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p) => <StatusBadge type="payment" status={p.status} />,
    },
    {
      key: "actions",
      header: "Chi tiết",
      render: (p) => (
        <button
          onClick={() => setSelectedPayment(p)}
          className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>Xem</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã giao dịch, ref..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="PENDING">Đang chờ</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="lich-su-thanh-toan-thue-bao" />

      {/* Payment Detail Drawer */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chi Tiết Giao Dịch</h3>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Trạng thái</span>
                  <StatusBadge type="payment" status={selectedPayment.status} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Mã giao dịch:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Mã tham chiếu (Ref):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPayment.transaction_ref || selectedPayment.transaction_id || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Số tiền thanh toán:</span>
                    <MoneyText amount={selectedPayment.amount} className="font-bold text-emerald-600" />
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Cổng thanh toán:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{selectedPayment.payment_gateway || selectedPayment.gateway}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Phương thức:</span>
                    <span className="text-slate-700 dark:text-slate-300">{selectedPayment.payment_method || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Thời điểm tạo:</span>
                    <DateText date={selectedPayment.created_at} type="datetime" className="text-slate-700 dark:text-slate-300" />
                  </div>
                  {selectedPayment.paid_at && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Thời điểm thanh toán:</span>
                      <DateText date={selectedPayment.paid_at} type="datetime" className="text-emerald-600 font-semibold" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-6 py-2 px-4 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
