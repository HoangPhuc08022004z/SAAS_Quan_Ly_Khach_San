"use client";

import React, { useState } from "react";
import { MoneyText } from "@/components/data/MoneyText";
import { AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface OverpaidRefundPromptProps {
  reservationId: string;
  balance: number;
  onRefundCompleted: () => void;
}

export function OverpaidRefundPrompt({
  reservationId,
  balance,
  onRefundCompleted,
}: OverpaidRefundPromptProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (balance >= 0) return null;

  const refundAmount = Math.abs(balance);

  async function handleRefund() {
    try {
      setIsProcessing(true);
      await api.createRefundRequest(reservationId, {
        amount: refundAmount,
        reason: "Hoàn trả tiền cọc thừa sau khi quyết toán Folio trả phòng",
      });
      toast.success(
        "Đã tạo yêu cầu hoàn trả tiền cọc thừa thành công. Vui lòng kiểm tra mục Hoàn tiền!"
      );
      onRefundCompleted();
    } catch (err: any) {
      toast.error(err.message || "Tạo yêu cầu hoàn tiền thất bại");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.03] space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground text-sm">
            Tiền cọc của khách lớn hơn tổng chi phí thực tế
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Số tiền khách nộp thừa: <strong className="text-blue-600 dark:text-blue-400"><MoneyText amount={refundAmount} /></strong>.
            Theo quy định, bạn cần hoàn lại số tiền thừa này cho khách trước khi hoàn tất thủ tục Check-out.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-blue-500/20">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleRefund}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
          Tạo phiếu hoàn cọc thừa (<MoneyText amount={refundAmount} />)
        </button>
      </div>
    </div>
  );
}
