"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { resetDb, getDb } from "@/mocks/db";
import {
  setSimulateFailure,
  getSimulateFailure,
  setForcePaymentStatus,
  getForcePaymentStatus,
} from "@/mocks/latency";
import { useSession } from "@/lib/auth/use-session";
import { toast } from "sonner";
import { RotateCcw, AlertTriangle, CreditCard, Shield, Home } from "lucide-react";

export default function DevResetPage() {
  const [failMode, setFailMode] = useState<string>("NONE");
  const [payMode, setPayMode] = useState<string>("AUTO");
  const { account, tenant, subscription, user, role } = useSession();

  useEffect(() => {
    setFailMode(getSimulateFailure());
    setPayMode(getForcePaymentStatus());
  }, []);

  const handleResetData = () => {
    resetDb();
    toast.success("Đã đặt lại dữ liệu mẫu thành công về trạng thái ban đầu!");
    setTimeout(() => window.location.reload(), 600);
  };

  const handleFailChange = (mode: any) => {
    setSimulateFailure(mode);
    setFailMode(mode);
    toast.info(`Chế độ giả lập lỗi: ${mode}`);
  };

  const handlePayChange = (status: any) => {
    setForcePaymentStatus(status);
    setPayMode(status);
    toast.info(`Trạng thái thanh toán cưỡng bức: ${status}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Công cụ phát triển & Đặt lại dữ liệu mẫu
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dành cho kiểm thử giao diện, kiểm thử luồng lỗi và demo đồ án.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* 1. Reset Database */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Khôi phục dữ liệu ban đầu (mock-data.json)
              </h2>
              <p className="text-xs text-slate-500">
                Xóa toàn bộ các thay đổi trong localStorage và nạp lại 32 bảng chuẩn.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            Đặt lại toàn bộ dữ liệu mẫu
          </button>
        </div>

        {/* 2. Error Simulation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Giả lập lỗi hệ thống (Error Injection)
              </h2>
              <p className="text-xs text-slate-500">
                Bật lỗi để kiểm tra các trạng thái ErrorState và thông báo tiếng Việt trên UI.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "NONE", label: "Bình thường (200)" },
              { id: "ERROR_500", label: "Lỗi máy chủ (500)" },
              { id: "ERROR_403", label: "Không có quyền (403)" },
              { id: "ERROR_409", label: "Xung đột dữ liệu (409)" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleFailChange(opt.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  failMode === opt.id
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Payment Webhook Simulator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Cưỡng bức kết quả thanh toán Webhook
              </h2>
              <p className="text-xs text-slate-500">
                Điều chỉnh để demo luồng thanh toán thành công hoặc thất bại theo ý muốn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "AUTO", label: "Ngẫu nhiên (90% OK)" },
              { id: "SUCCESS", label: "Luôn THÀNH CÔNG" },
              { id: "FAILED", label: "Luôn THẤT BẠI" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handlePayChange(opt.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  payMode === opt.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Current Session Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Thông tin phiên hiện tại</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400">Tài khoản (Account):</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{account?.email || "Chưa đăng nhập"}</p>
              <p className="text-[11px] text-slate-500">{account?.is_admin ? "Quản trị viên (Admin)" : "Chủ khách sạn (Owner)"}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-400">Nhân viên PMS:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || "Chưa đăng nhập"}</p>
              <p className="text-[11px] text-slate-500">{role?.name || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
