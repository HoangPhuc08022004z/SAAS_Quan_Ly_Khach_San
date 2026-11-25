import React from "react";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-sm">
        <XCircle className="w-16 h-16 text-amber-500 mx-auto" />
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Thanh toán đã bị hủy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bạn chưa bị trừ tiền. Bạn có thể thử thanh toán lại bất cứ lúc nào.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
