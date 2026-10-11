"use client";

import React from "react";
import { MoneyText } from "@/components/data/MoneyText";
import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

interface BalanceSummaryProps {
  totalCharges: number;
  totalPaid: number;
  balance: number;
}

export function BalanceSummary({
  totalCharges,
  totalPaid,
  balance,
}: BalanceSummaryProps) {
  const isZero = balance === 0;
  const isDebt = balance > 0;
  const isOverpaid = balance < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Total Charges */}
      <div className="p-4 rounded-xl border bg-card shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
          Tổng chi phí (Folio)
        </span>
        <div className="text-2xl font-bold text-foreground">
          <MoneyText amount={totalCharges} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Bao gồm phòng, ăn uống & dịch vụ
        </p>
      </div>

      {/* Total Paid */}
      <div className="p-4 rounded-xl border bg-card shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
          Đã thanh toán (Cọc & Khác)
        </span>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          <MoneyText amount={totalPaid} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Khoản tiền khách đã thanh toán thành công
        </p>
      </div>

      {/* Net Balance */}
      <div
        className={`p-4 rounded-xl border shadow-sm ${
          isZero
            ? "bg-emerald-500/10 border-emerald-500/30"
            : isDebt
            ? "bg-rose-500/10 border-rose-500/30"
            : "bg-blue-500/10 border-blue-500/30"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Công nợ còn lại (Balance)
          </span>
          {isZero && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          {isDebt && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          {isOverpaid && <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        </div>

        <div
          className={`text-2xl font-black ${
            isZero
              ? "text-emerald-600 dark:text-emerald-400"
              : isDebt
              ? "text-rose-600 dark:text-rose-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          <MoneyText amount={balance} />
        </div>

        <p className="text-xs mt-1 font-medium text-foreground/80">
          {isZero && "Đã tất toán 0 đ. Có thể hoàn tất trả phòng."}
          {isDebt && "Khách còn thiếu. Cần thu thêm trước khi Check-out."}
          {isOverpaid && "Tiền nộp thừa. Cần hoàn lại cho khách trước khi Check-out."}
        </p>
      </div>
    </div>
  );
}
