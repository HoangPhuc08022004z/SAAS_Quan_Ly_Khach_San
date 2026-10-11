// FR-S01: Đăng ký tài khoản
// Service: api.registerAccount

import React from "react";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Hotel } from "lucide-react";

export default function RegisterPage() {
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
            Đăng ký tài khoản mới
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tạo tài khoản để đăng ký gói thuê bao và quản lý chuỗi khách sạn của bạn.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <RegisterForm />
        </div>

        <div className="text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
