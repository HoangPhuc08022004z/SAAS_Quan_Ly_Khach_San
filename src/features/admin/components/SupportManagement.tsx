"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { fetchSupportTicketDetail, updateTicketStatus } from "@/lib/api";
import type { SupportTicketAdminResponse } from "@/lib/api/types/openapi.interface";
import { toast } from "sonner";
import { HelpCircle, X, CheckCircle2, Lock } from "lucide-react";

// Ticket do chatbot tự tạo khi không trả lời được; Admin chỉ được đặt RESOLVED hoặc CLOSED.
export function SupportManagement({ initialTickets }: { initialTickets: SupportTicketAdminResponse[] }) {
  const [tickets, setTickets] = useState<SupportTicketAdminResponse[]>(initialTickets);
  const [selected, setSelected] = useState<SupportTicketAdminResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openDetail = async (ticket: SupportTicketAdminResponse) => {
    setSelected(ticket);
    try {
      // Gọi OpenAPI: GET /api/v1/saas/admin/support-tickets/{ticketId}
      setSelected(await fetchSupportTicketDetail(ticket.supportTicketId));
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải chi tiết ticket.");
    }
  };

  const handleUpdateStatus = async (status: "RESOLVED" | "CLOSED") => {
    if (!selected) return;
    setIsUpdating(true);
    try {
      // Gọi OpenAPI: PATCH /api/v1/saas/admin/support-tickets/{ticketId}/status
      const updated = await updateTicketStatus(selected.supportTicketId, status);
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.supportTicketId === updated.supportTicketId ? updated : t)));
      toast.success(`Đã cập nhật trạng thái sang: ${status}`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật trạng thái.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = tickets.filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter));

  const columns: Column<SupportTicketAdminResponse>[] = [
    {
      key: "supportTicketId",
      header: "Mã Ticket",
      render: (t) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{t.supportTicketId}</span>,
    },
    {
      key: "content",
      header: "Câu hỏi chatbot không trả lời được",
      render: (t) => <div className="text-xs text-slate-900 dark:text-white line-clamp-2 max-w-md">{t.content}</div>,
    },
    {
      key: "accountName",
      header: "Người gửi",
      render: (t) => (
        <div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.accountName}</div>
          <div className="text-[11px] text-slate-400">{t.accountEmail}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (t) => <StatusBadge type="ticket" status={t.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (t) => (
        <button onClick={() => openDetail(t)} className="text-xs font-semibold text-blue-600 hover:underline">
          Xử lý →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Mới mở (OPEN)</option>
          <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
          <option value="CLOSED">Đã đóng (CLOSED)</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="danh-sach-ticket-ho-tro" />

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ticket #{selected.supportTicketId}</h3>
                  <p className="text-[11px] text-slate-400">
                    {selected.accountName} • {selected.accountEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Trạng thái hiện tại:</span>
              <StatusBadge type="ticket" status={selected.status} />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30 space-y-1">
              <div className="text-[11px] font-bold uppercase text-slate-400">Nội dung câu hỏi</div>
              <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{selected.content}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus("CLOSED")}
                disabled={isUpdating || selected.status === "CLOSED"}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl dark:bg-slate-800 dark:text-slate-200"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Đóng ticket</span>
              </button>
              <button
                onClick={() => handleUpdateStatus("RESOLVED")}
                disabled={isUpdating || selected.status === "RESOLVED"}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đánh dấu đã giải quyết</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
