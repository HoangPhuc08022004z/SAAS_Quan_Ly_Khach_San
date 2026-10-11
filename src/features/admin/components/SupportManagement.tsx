"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { HelpCircle, MessageSquare, Send, X, User } from "lucide-react";

export function SupportManagement({ initialTickets }: { initialTickets: any[] }) {
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openTicketDetail = async (ticket: any) => {
    setSelectedTicket(ticket);
    try {
      const full = await api.adminGetTicket(ticket.id);
      setSelectedTicket(full);
      setReplies(full.replies || []);
    } catch {
      toast.error("Không thể tải chi tiết ticket.");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await api.adminUpdateTicket(selectedTicket.id, status);
      setSelectedTicket((prev: any) => ({ ...prev, status: updated.status }));
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)));
      toast.success(`Đã cập nhật trạng thái sang: ${status}`);
    } catch {
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setIsSubmitting(true);
    try {
      await api.adminReplyTicket(selectedTicket.id, replyText.trim());
      const newReply = {
        id: `rep_${Date.now()}`,
        ticket_id: selectedTicket.id,
        sender_type: "ADMIN",
        message: replyText.trim(),
        created_at: new Date().toISOString(),
      };
      setReplies((prev) => [...prev, newReply]);
      setReplyText("");
      toast.success("Đã gửi phản hồi thành công.");
    } catch {
      toast.error("Không thể gửi phản hồi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = tickets.filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter));

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "Mã Ticket",
      render: (t) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{t.id}</span>,
    },
    {
      key: "subject",
      header: "Tiêu đề yêu cầu",
      render: (t) => (
        <div>
          <div className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{t.subject}</div>
          <div className="text-[11px] text-slate-400 line-clamp-1">{t.message}</div>
        </div>
      ),
    },
    {
      key: "tenant_id",
      header: "Tenant ID",
      render: (t) => <span className="text-xs text-slate-500 font-mono">{t.tenant_id}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (t) => <StatusBadge type="ticket" status={t.status} />,
    },
    {
      key: "created_at",
      header: "Ngày gửi",
      render: (t) => <DateText date={t.created_at} type="datetime" className="text-xs text-slate-400" />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (t) => (
        <button
          onClick={() => openTicketDetail(t)}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
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
          <option value="OPEN">Chờ tiếp nhận (OPEN)</option>
          <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
          <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
          <option value="CLOSED">Đã đóng (CLOSED)</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="danh-sach-ticket-ho-tro" />

      {/* Ticket Detail & Reply Panel */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ticket #{selectedTicket.id}</h3>
                    <p className="text-[11px] text-slate-400">Tenant: {selectedTicket.tenant_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Trạng thái:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="OPEN">Chờ tiếp nhận (OPEN)</option>
                  <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                  <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
                  <option value="CLOSED">Đã đóng (CLOSED)</option>
                </select>
              </div>

              {/* Original Content */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{selectedTicket.subject}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedTicket.message}</div>
              </div>

              {/* Conversation History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>Lịch sử phản hồi ({replies.length})</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {replies.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">Chưa có phản hồi nào.</div>
                  ) : (
                    replies.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          r.sender_type === "ADMIN"
                            ? "bg-blue-50 border border-blue-100 text-blue-900 ml-4 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-100"
                            : "bg-slate-100 text-slate-800 mr-4 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75">
                          <span className="font-bold">{r.sender_type === "ADMIN" ? "Quản trị viên (Bạn)" : "Khách hàng"}</span>
                          <DateText date={r.created_at} type="datetime" />
                        </div>
                        <p>{r.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập nội dung phản hồi cho khách hàng..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi phản hồi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
