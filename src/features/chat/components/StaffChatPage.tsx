"use client";

import React, { useState } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Bot, Sparkles, BookOpen, ShieldCheck, Database, HelpCircle } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";

export function StaffChatPage() {
  const { role, user } = useSession();

  const sopTopics = [
    { title: "Quy trình Check-in", desc: "Điều kiện bàn giao phòng, kiểm tra trạng thái READY và xác thực giấy tờ khách." },
    { title: "Quy trình Check-out & Quyết toán", desc: "Đối soát Folio, tất toán công nợ về 0 đ và chuyển trạng thái phòng VACANT_DIRTY." },
    { title: "Xử lý No-Show & Khấu trừ cọc", desc: "Mốc 14:00, thời gian chờ phản hồi 12 giờ, Manager xác nhận và giải phóng phòng." },
    { title: "Chốt sổ Night Audit", desc: "Tổng hợp số liệu doanh thu phòng, F&B, kiểm toán số liệu và quy trình điều chỉnh." },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Trợ lý AI Nhân viên Khách sạn (RAG SOP & PMS)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hỏi đáp trực tiếp dữ liệu vận hành thời gian thực, quy trình chuẩn SOP theo vai trò ({role?.name || "Nhân viên"})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Chat Widget in Embedded Full Height Mode */}
        <div className="lg:col-span-2 min-h-[620px] rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
          <ChatWidget mode="staff" isFloating={false} className="h-full border-none shadow-none" />
        </div>

        {/* Right Side: Quick Guide & SOP Reference */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Sổ tay nghiệp vụ chuẩn (SOP Knowledge Base)
            </h3>
            <p className="text-xs text-muted-foreground">
              Chatbot được huấn luyện trên tài liệu chính sách và dữ liệu PMS thực tế của khách sạn. Bạn có thể bấm để hỏi nhanh các nghiệp vụ sau:
            </p>

            <div className="space-y-2.5">
              {sopTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border text-xs cursor-default"
                >
                  <div className="font-semibold text-foreground mb-0.5">
                    {topic.title}
                  </div>
                  <div className="text-muted-foreground text-[11px] leading-relaxed">
                    {topic.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" />
              Nguồn dữ liệu truy xuất:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Cơ sở dữ liệu PMS Live (Phòng, Đặt phòng, Folio, Thanh toán)</li>
              <li>Chính sách khách sạn (Hủy phòng, Cọc, Giờ nhận/trả)</li>
              <li>Tài liệu quy trình vận hành SOP nội bộ đã lập chỉ mục RAG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
