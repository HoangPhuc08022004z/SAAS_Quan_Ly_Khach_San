"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { readReservationPayment } from "@/lib/payment-return";

function ReturnRouter() {
  const router = useRouter();
  const result = useSearchParams().get("result") === "cancel" ? "cancel" : "success";

  useEffect(() => {
    const pending = readReservationPayment();
    if (pending) {
      // Đặt cọc của khách: về trang tra cứu, tự theo dõi trạng thái
      const contact = pending.email ? `email=${encodeURIComponent(pending.email)}` : `phone=${encodeURIComponent(pending.phone ?? "")}`;
      router.replace(`/p/reservation?code=${encodeURIComponent(pending.code)}&${contact}&payment=${result}`);
    } else {
      // Thuê bao của Owner
      router.replace(result === "cancel" ? "/owner/subscription" : "/owner/subscription/result");
    }
  }, [result, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-xs text-slate-400 gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Đang xác nhận giao dịch...
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <ReturnRouter />
    </Suspense>
  );
}
