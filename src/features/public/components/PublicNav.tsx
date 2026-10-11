import React from "react";
import Link from "next/link";
import { Hotel, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Hotel className="h-5 w-5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            HotelSaaS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-blue-600 transition-colors">Tính năng</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Bảng giá gói</a>
          <a href="#demo-hotels" className="hover:text-blue-600 transition-colors">Khách sạn mẫu</a>
          <Link href="/dev/reset" className="text-emerald-600 hover:text-emerald-700">Dữ liệu mẫu</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/30 transition-all"
          >
            <span>Dùng thử</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Hotel className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-200">HotelSaaS Platform</span>
        </div>
        <p>© 2026 HotelSaaS. Nền tảng quản lý khách sạn đa thuê bao tích hợp Trợ lý AI Chatbot RAG.</p>
        <p className="mt-1">Múi giờ chuẩn: Asia/Ho_Chi_Minh • Tiền tệ: VND</p>
      </div>
    </footer>
  );
}
