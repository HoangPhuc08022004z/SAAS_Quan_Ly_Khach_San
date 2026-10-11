"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { StatusBadge } from "@/components/data/StatusBadge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export function PaymentCheckout({ subscription }: { subscription: any }) {
  const router = useRouter();
  const [method, setMethod] = useState("MOMO_QR");
  const [gateway, setGateway] = useState("MOMO");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await api.createSubscriptionPayment(subscription.id, {
        payment_method: method,
        gateway: gateway,
      });
      toast.success("Đang chuyển hướng sang cổng thanh toán...");
      router.push(res.payUrl);
    } catch {
      toast.error("Không thể khởi tạo giao dịch thanh toán.");
      setIsProcessing(false);
    }
  };

  const methods = [
    { id: "MOMO_QR", name: "MoMo QR / Ví MoMo", gw: "MOMO", icon: QrCode },
    { id: "VNPAY_QR", name: "VNPAY-QR (Ngân hàng)", gw: "VNPAY", icon: CreditCard },
    { id: "VIETQR", name: "Chuyển khoản VietQR", gw: "BANK_TRANSFER", icon: QrCode },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Đơn hàng thanh toán</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Kích hoạt gói {subscription.plan?.name || "Standard"}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Tổng số tiền</span>
            <div>
              <MoneyText amount={subscription.price || subscription.plan?.price || 0} className="text-lg font-black text-blue-600" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Chọn phương thức thanh toán qua cổng điện tử:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {methods.map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setMethod(m.id);
                    setGateway(m.gw);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col items-center text-center gap-2 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/20"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Môi trường thanh toán thử nghiệm an toàn (Mock Sandbox)</span>
          </div>
          <p className="text-[11px] opacity-80">
            Sau khi nhấn &quot;Thanh toán ngay&quot;, hệ thống sẽ tự động mô phỏng Webhook phản hồi từ cổng thanh toán trong 3–5 giây.
          </p>
        </div>

        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-3 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang kết nối cổng thanh toán...</span>
            </>
          ) : (
            <>
              <span>Xác nhận & Tiến hành thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function PaymentResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [payment, setPayment] = useState<any | null>(null);
  const [status, setStatus] = useState<"PENDING" | "PROCESSING" | "SUCCESS" | "FAILED">("PENDING");
  const [secondsWaited, setSecondsWaited] = useState(0);

  useEffect(() => {
    if (!paymentId) return;

    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const p = await api.getSubscriptionPayment(paymentId);
        if (isMounted) {
          setPayment(p);
          if (p.status === "SUCCESS" || p.status === "FAILED") {
            setStatus(p.status);
            return;
          }
        }
      } catch {
        // Ignored
      }
    };

    fetchStatus();

    // Auto simulate webhook after 3 seconds if still PENDING
    const timer = setTimeout(async () => {
      try {
        await api.simulatePaymentWebhook("MOMO", {
          transaction_id: paymentId,
          status: "SUCCESS",
        });
        const updated = await api.getSubscriptionPayment(paymentId);
        if (isMounted) {
          setPayment(updated);
          setStatus(updated.status);
        }
      } catch {
        if (isMounted) setStatus("FAILED");
      }
    }, 3500);

    const interval = setInterval(() => {
      setSecondsWaited((s) => s + 1);
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [paymentId]);

  if (!paymentId) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Không tìm thấy mã giao dịch. Vui lòng quay lại trang thuê bao.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-6">
        {status === "PENDING" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Đang Chờ Xử Lý Giao Dịch</h3>
              <p className="text-xs text-slate-400 mt-1">
                Đang đối soát tín hiệu thanh toán từ cổng... ({secondsWaited}s)
              </p>
            </div>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thuê bao của bạn đã được kích hoạt trạng thái <strong>ACTIVE</strong>. Bạn có thể bắt đầu cấu hình khách sạn ngay bây giờ.
              </p>
            </div>
          </div>
        )}

        {status === "FAILED" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Giao Dịch Thất Bại</h3>
              <p className="text-xs text-slate-500 mt-1">
                Giao dịch không thể hoàn tất hoặc bị từ chối bởi cổng thanh toán. Vui lòng thử lại với giao dịch mới.
              </p>
            </div>
          </div>
        )}

        {payment && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-2 text-left">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Mã giao dịch:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{payment.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Số tiền:</span>
              <MoneyText amount={payment.amount} className="font-bold text-slate-900 dark:text-white" />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Trạng thái:</span>
              <StatusBadge type="payment" status={status} />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          {status === "SUCCESS" && (
            <button
              onClick={() => router.push("/owner/properties")}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Bắt đầu cấu hình khách sạn →
            </button>
          )}

          {status === "FAILED" && (
            <button
              onClick={() => router.push("/owner/subscription/pay")}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại với giao dịch mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
