// FR-S01: Đăng nhập nền tảng SaaS
// Service: api.loginAccount, api.getCurrentAccount

import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Hotel } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Hotel className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              HotelSaaS
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Đăng nhập cổng Nền Tảng
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dành cho Quản trị viên SaaS và Chủ khách sạn (Owner).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            Đăng ký gói ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
