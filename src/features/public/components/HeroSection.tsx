import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Building2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950),theme(colors.slate.950))] opacity-60" />

      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50/80 text-blue-700 text-xs font-semibold dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thế hệ phần mềm quản lý khách sạn SaaS mới có AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Quản Lý Chuỗi Khách Sạn Đa Thuê Bao Thông Minh Với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Trợ Lý AI RAG</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Tối ưu toàn diện từ đặt phòng, lễ tân check-in/out, sơ đồ phòng trực quan, dịch vụ F&B, buồng phòng đến chốt ca Night Audit và Chatbot thông minh phục vụ khách lưu trú 24/7.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <span>Bắt đầu dùng thử ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/p/prop_abc_hn"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Xem trang khách sạn mẫu</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-8 max-w-2xl mx-auto text-left text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Sơ đồ phòng Live</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
            <Bot className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Chatbot RAG tài liệu</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200/80 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs col-span-2 sm:col-span-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Chốt sổ Night Audit</span>
          </div>
        </div>
      </div>
    </section>
  );
}
