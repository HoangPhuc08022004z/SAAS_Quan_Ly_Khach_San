"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { api, askChatbot } from "@/lib/api";
import { toast } from "sonner";
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Bot,
  Send,
  X,
  AlertCircle,
  FileQuestion,
} from "lucide-react";

export function OwnerSupportView({ initialTickets }: { initialTickets: any[] }) {
  const [tickets, setTickets] = useState<any[]>(initialTickets);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Platform AI Chat state
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: "user" | "bot"; text: string; sources?: string[] }>
  >([
    {
      id: "init",
      sender: "bot",
      text: "Xin chào Quý khách! Tôi là trợ lý ảo hỗ trợ kỹ thuật và chính sách nền tảng SaaS. Bạn cần giải đáp câu hỏi nào?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung yêu cầu.");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await api.createTicket({
        title: subject.trim(),
        message: message.trim(),
      });
      setTickets((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setSubject("");
      setMessage("");
      toast.success("Đã gửi ticket hỗ trợ thành công! Kỹ thuật viên sẽ phản hồi sớm.");
    } catch {
      toast.error("Không thể tạo ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isBotThinking) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, sender: "user", text: userText },
    ]);
    setIsBotThinking(true);

    try {
      // Gọi OpenAPI: GET /api/v1/chat/saas?question=
      const answer = await askChatbot(userText);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: "bot",
          text: answer,
        },
      ]);
    } catch (err: any) {
      const detail = String(err?.message || "");
      // 403 = chưa đăng nhập / token hết hạn / tài khoản không phải Owner (ví dụ Admin)
      const reason = /403|Forbidden|HTTP 403/i.test(detail)
        ? "Phiên đăng nhập đã hết hạn hoặc tài khoản không có quyền dùng chatbot (chỉ dành cho Owner). Vui lòng đăng nhập lại bằng tài khoản Owner."
        : "Hiện tại tôi gặp sự cố khi tra cứu cơ sở tri thức. Quý khách vui lòng tạo ticket để kỹ thuật viên hỗ trợ trực tiếp.";
      console.error("[chatbot]", detail);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `b_${Date.now()}`,
          sender: "bot",
          text: `Xin lỗi, ${reason}${detail ? ` (Chi tiết: ${detail})` : ""}`,
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

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
      key: "status",
      header: "Trạng thái",
      render: (t) => <StatusBadge type="ticket" status={t.status} />,
    },
    {
      key: "created_at",
      header: "Thời điểm gửi",
      render: (t) => <DateText date={t.created_at} type="datetime" className="text-xs text-slate-400" />,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 2-Column layout: AI Support Bot + Ticket Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Support Chat Panel (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Trợ Lý AI Nền Tảng</h3>
                <p className="text-[10px] text-slate-400">Tra cứu chính sách, gói và hướng dẫn</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSubject("Cần hỗ trợ vấn đề gặp phải");
                setIsCreateOpen(true);
              }}
              className="text-[11px] text-blue-600 font-semibold hover:underline"
            >
              Gửi ticket
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col text-xs ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-xs"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] opacity-80">
                      <span>Nguồn trích dẫn: {m.sources.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isBotThinking && (
              <div className="text-xs text-slate-400 italic flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>Trợ lý AI đang tra cứu tri thức...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Hỏi về gia hạn, gói, tính năng..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isBotThinking || !chatInput.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Tickets Management (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Yêu Cầu Hỗ Trợ Đã Gửi ({tickets.length})</h3>
              <p className="text-xs text-slate-400">Theo dõi tiến độ giải quyết từ đội ngũ kỹ sư SaaS</p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo ticket mới</span>
            </button>
          </div>

          <DataTable columns={columns} data={tickets} exportFileName="danh-sach-ticket-cua-toi" />
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tiêu đề tóm tắt vấn đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ví dụ: Lỗi kết nối cấu hình cổng MoMo..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô tả chi tiết nội dung sự cố <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Vui lòng nêu rõ các bước thao tác, thời điểm xảy ra sự cố..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
