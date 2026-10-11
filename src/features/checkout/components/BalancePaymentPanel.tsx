"use client";

import React, { useState } from "react";
import { MoneyText } from "@/components/data/MoneyText";
import { CreditCard, QrCode, Banknote, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface BalancePaymentPanelProps {
  reservationId: string;
  balance: number;
  onPaymentCompleted: () => void;
}

export function BalancePaymentPanel({
  reservationId,
  balance,
  onPaymentCompleted,
}: BalancePaymentPanelProps) {
  const [method, setMethod] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  if (balance <= 0) return null;

  async function handleCreatePayment() {
    try {
      setIsProcessing(true);
      const res = await api.createBalancePayment(reservationId, balance, method);

      if (res.payUrl) {
        setPayUrl(res.payUrl);
      }

      toast.info("Giao dịch thanh toán công nợ đã được tạo. Đang xử lý...");

      // Simulate payment webhook auto-success after 3 seconds
      setTimeout(async () => {
        try {
          await api.simulatePmsPaymentWebhook("MOMO", {
            payment_id: res.payment.id,
            status: "SUCCESS",
          });
          toast.success("Thanh toán công nợ thành công! Công nợ đã được cập nhật về 0 đ.");
          onPaymentCompleted();
        } catch (err: any) {
          toast.error("Không thể tự động cập nhật thanh toán");
        } finally {
          setIsProcessing(false);
          setPayUrl(null);
        }
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Tạo thanh toán công nợ thất bại");
      setIsProcessing(false);
    }
  }

  return (
    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.02] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-500" />
            Thu công nợ còn thiếu
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Số tiền cần thu: <strong className="text-foreground"><MoneyText amount={balance} /></strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setMethod("CASH")}
          className={`p-3 rounded-lg border text-left transition-all ${
            method === "CASH"
              ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <Banknote className="w-4 h-4" />
            Tiền mặt
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("MOMO")}
          className={`p-3 rounded-lg border text-left transition-all ${
            method === "MOMO"
              ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <QrCode className="w-4 h-4" />
            Ví MoMo
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("VNPAY")}
          className={`p-3 rounded-lg border text-left transition-all ${
            method === "VNPAY"
              ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <QrCode className="w-4 h-4" />
            VNPAY-QR
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("BANK_TRANSFER")}
          className={`p-3 rounded-lg border text-left transition-all ${
            method === "BANK_TRANSFER"
              ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            <CreditCard className="w-4 h-4" />
            Chuyển khoản
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          {payUrl ? (
            <span className="text-primary font-medium flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Đang đợi cổng xác nhận giao dịch...
            </span>
          ) : (
            "Chọn phương thức và ấn Thu tiền để thanh toán"
          )}
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleCreatePayment}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Đang thanh toán...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Xác nhận thu tiền (<MoneyText amount={balance} />)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
