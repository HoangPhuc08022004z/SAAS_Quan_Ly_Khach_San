"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUserProfile, retryInitialPayment } from "@/lib/api";
import type { UserProfile } from "@/lib/api/types/openapi.interface";
import { StatusBadge } from "@/components/data/StatusBadge";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, CheckCircle, RefreshCw, ArrowRight, Clock } from "lucide-react";

/**
 * Thanh toán lần đầu qua Stripe Checkout.
 * Backend tạo Checkout Session khi Admin duyệt; Owner chỉ cần mở lại link bằng retry-payment.
 */
export function PaymentCheckout({ profile }: { profile: UserProfile }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const canPay = profile.subscriptionStatus === "PENDING_PAYMENT";

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // Gọi OpenAPI: POST /api/v1/user/subscriptions/retry-payment
      const res = await retryInitialPayment();
      if (res?.checkoutUrl) {
        toast.success("Đang chuyển hướng sang cổng thanh toán Stripe...");
        window.location.href = res.checkoutUrl;
        return;
      }
      toast.success(res?.message || "Đã gửi link thanh toán qua email.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể khởi tạo phiên thanh toán.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Thuê bao của</span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {profile.tenantName || profile.userName}
            </h3>
          </div>
          {profile.subscriptionStatus && (
            <StatusBadge type="subscription" status={profile.subscriptionStatus} />
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Thanh toán an toàn qua Stripe Checkout</span>
          </div>
          <p className="text-[11px] opacity-80">
            Bạn sẽ được chuyển sang trang thanh toán của Stripe. Kết quả được hệ thống ghi nhận tự động qua webhook,
            link thanh toán cũng được gửi kèm vào email của bạn.
          </p>
        </div>

        {!canPay && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Chỉ thanh toán được khi yêu cầu đã được Admin duyệt (trạng thái &quot;Chờ thanh toán&quot;). Vui lòng kiểm tra
              lại trạng thái thuê bao.
            </span>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={isProcessing || !canPay}
          className="w-full py-3 px-6 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang kết nối Stripe...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Thanh toán qua Stripe</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Ngày hết hạn trước khi thanh toán sớm (xem MySubscriptionView). Thuê bao vẫn ACTIVE trong lúc trả tiền
// nên chỉ coi là thành công khi endDate đã lùi xa hơn mốc này.
export const RENEWAL_BASELINE_KEY = "renewal_baseline_end_date";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_TRIES = 20;

/**
 * Kết quả thanh toán: Stripe chỉ báo qua webhook nên FE poll profile đến khi Subscription ACTIVE.
 */
export function PaymentResultView() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tries, setTries] = useState(0);
  const [baseline] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(RENEWAL_BASELINE_KEY);
    } catch {
      return null;
    }
  });
  const isActive =
    profile?.subscriptionStatus === "ACTIVE" &&
    (!baseline || (!!profile.endDate && profile.endDate > baseline)); // YYYY-MM-DD so sánh được theo chuỗi
  const timedOut = !isActive && tries >= POLL_MAX_TRIES;

  useEffect(() => {
    if (isActive) {
      try {
        sessionStorage.removeItem(RENEWAL_BASELINE_KEY);
      } catch {
        // bỏ qua
      }
      return;
    }
    if (timedOut) return;
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        try {
          const p = await fetchUserProfile();
          if (!cancelled) setProfile(p);
        } catch {
          // bỏ qua, thử lại ở lần poll kế tiếp
        }
        if (!cancelled) setTries((t) => t + 1);
      },
      tries === 0 ? 0 : POLL_INTERVAL_MS
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tries, isActive, timedOut]);

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center space-y-6">
        {isActive ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thuê bao của bạn đã được kích hoạt trạng thái <strong>ACTIVE</strong>.
              </p>
            </div>
            <button
              onClick={() => router.push("/owner/subscription")}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Xem thuê bao của tôi →
            </button>
          </div>
        ) : timedOut ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Chưa Nhận Được Xác Nhận</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hệ thống chưa ghi nhận thanh toán. Nếu bạn đã thanh toán, vui lòng chờ thêm ít phút rồi kiểm tra lại.
              </p>
            </div>
            <button
              onClick={() => setTries(0)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Kiểm tra lại
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Đang Xác Nhận Thanh Toán</h3>
              <p className="text-xs text-slate-400 mt-1">Đang chờ tín hiệu từ Stripe... ({tries}/{POLL_MAX_TRIES})</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
