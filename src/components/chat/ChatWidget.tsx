"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { DisclaimerNote } from "./DisclaimerNote";
import { SourceCitations } from "./SourceCitations";
import { FeedbackButtons, TypingIndicator, RoleSuggestionChips } from "./ChatHelpers";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  citations?: string[];
  liveAvailability?: any;
  canEscalate?: boolean;
}

interface ChatWidgetProps {
  mode: "guest" | "staff" | "platform";
  propertyId?: string;
  isFloating?: boolean;
  className?: string;
}

export function ChatWidget({
  mode,
  propertyId,
  isFloating = false,
  className,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { role, currentPropertyId } = useSession();

  const targetPropId = propertyId || currentPropertyId || "prop_abc_hn";

  // Initial welcome message and suggestions
  useEffect(() => {
    let welcome = "Xin chào! Tôi là trợ lý ảo AI. Tôi có thể giúp gì cho bạn?";
    if (mode === "guest") {
      welcome = "Chào mừng quý khách! Tôi có thể giải đáp thông tin về giá phòng, giờ nhận/trả phòng và chính sách khách sạn.";
    } else if (mode === "staff") {
      welcome = `Chào ${role?.name || "bạn"}! Tôi là trợ lý SOP và dữ liệu PMS. Bạn có thể hỏi số liệu ngày hoặc quy trình vận hành.`;
    } else if (mode === "platform") {
      welcome = "Chào bạn! Tôi có thể hỗ trợ giải đáp các thắc mắc về cài đặt hệ thống SaaS, cổng thanh toán hoặc tạo yêu cầu hỗ trợ.";
    }

    setMessages([{ id: "msg_welcome", sender: "bot", text: welcome }]);

    if (mode === "staff") {
      api.getChatSuggestions(role?.code || "MANAGER").then(setSuggestions);
    } else if (mode === "guest") {
      setSuggestions(["Giờ nhận phòng tiêu chuẩn?", "Giá phòng và phòng còn trống?", "Chính sách hủy phòng"]);
    }
  }, [mode, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: `usr_${Date.now()}`, sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let botResponse: { answer: string; citations?: string[]; canEscalateToTicket?: boolean; liveAvailability?: any } = {
        answer: "Hệ thống đang xử lý câu hỏi của bạn...",
      };

      if (mode === "guest") {
        botResponse = await api.askGuestBot(targetPropId, query);
      } else if (mode === "staff") {
        botResponse = await api.askStaffBot(query, { role: role?.code || "MANAGER", propertyId: targetPropId });
      } else {
        botResponse = await api.askSupportBot(query);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: "bot",
          text: botResponse.answer,
          citations: botResponse.citations,
          liveAvailability: botResponse.liveAvailability,
          canEscalate: botResponse.canEscalateToTicket,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: "bot",
          text: "Xin lỗi, hiện tại không thể kết nối tới mô hình AI. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async (originalQuery: string) => {
    await api.createTicket({
      title: `Yêu cầu hỗ trợ từ Chatbot: ${originalQuery.slice(0, 40)}...`,
      message: originalQuery,
      priority: "NORMAL",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `bot_esc_${Date.now()}`,
        sender: "bot",
        text: "Đã tạo ticket hỗ trợ thành công! Đội ngũ kỹ thuật sẽ phản hồi bạn trong thời gian sớm nhất.",
      },
    ]);
  };

  const chatContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 shadow-xl dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">
              {mode === "guest" ? "Trợ lý Khách sạn" : mode === "staff" ? "Trợ lý Nhân viên PMS" : "Hỗ trợ Nền tảng SaaS"}
            </h4>
            <span className="text-[10px] text-blue-100 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI RAG Powered
            </span>
          </div>
        </div>
        {isFloating && (
          <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {mode === "staff" && (
        <div className="p-2 bg-amber-50/50 dark:bg-slate-800/40">
          <DisclaimerNote />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex flex-col max-w-[85%]", m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start")}
          >
            <div
              className={cn(
                "p-3 rounded-2xl leading-relaxed shadow-sm",
                m.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
              )}
            >
              <p>{m.text}</p>
              {m.liveAvailability && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  <strong>Phòng trống thời gian thực:</strong>
                  <div>• {m.liveAvailability.deluxe}</div>
                  <div>• {m.liveAvailability.suite}</div>
                </div>
              )}
              {m.citations && <SourceCitations citations={m.citations} />}
            </div>

            {m.sender === "bot" && m.id !== "msg_welcome" && (
              <FeedbackButtons onFeedback={(helpful) => api.sendChatFeedback(m.id, helpful)} />
            )}

            {m.canEscalate && (
              <button
                type="button"
                onClick={() => handleEscalate(messages[messages.length - 2]?.text || "Hỏi đáp")}
                className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Gửi yêu cầu hỗ trợ (tạo Ticket) →
              </button>
            )}
          </div>
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <RoleSuggestionChips suggestions={suggestions} onSelect={(q) => handleSend(q)} />

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );

  if (!isFloating) {
    return <div className={cn("h-[550px] w-full max-w-2xl", className)}>{chatContent}</div>;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[360px] sm:w-[400px] h-[520px]">{chatContent}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl hover:scale-105 transition-all p-3.5"
          title="Mở Trợ lý ảo AI"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
