"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { clearReservationPayment } from "@/lib/payment-return";

const REDIRECT_SECONDS = 5;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [left, setLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    clearReservationPayment();
    const timer = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (left <= 0) router.replace("/");
  }, [left, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Thanh toán thành công</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cảm ơn bạn. Giao dịch đã được ghi nhận. Hệ thống sẽ cập nhật trạng thái trong giây lát.
        </p>
        <p className="text-xs text-slate-400">Tự động về trang chủ sau {Math.max(left, 0)} giây...</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
        >
          Về trang chủ ngay
        </Link>
      </div>
    </div>
  );
}
