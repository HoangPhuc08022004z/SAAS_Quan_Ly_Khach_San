"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { UsageMeter } from "@/components/data/UsageMeter";
import { formatBytes } from "@/lib/utils/format";
import {
  earlyRenewalSubscription,
  lateRenewalSubscription,
  resubmitSubscription,
  retryInitialPayment,
} from "@/lib/api";
import { durationUnitLabel } from "@/lib/api/adapters";
import { RENEWAL_BASELINE_KEY } from "./PaymentFlow";
import type { Plan } from "@/lib/api/types";
import type { UserProfile } from "@/lib/api/types/openapi.interface";
import { toast } from "sonner";
import {
  CreditCard,
  Calendar,
  Layers,
  RefreshCw,
  Bell,
  ArrowRight,
  Clock,
  RotateCcw,
} from "lucide-react";

export function MySubscriptionView({
  profile,
  plans,
  usage,
  reminders,
  onChanged,
}: {
  profile: UserProfile;
  plans: Plan[];
  usage: any;
  reminders: any[];
  onChanged: () => void;
}) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState<string>(plans[0]?.id || "");
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const status = profile.subscriptionStatus;
  const isExpired = status === "EXPIRED";
  const isPending = status === "PENDING" || status === "PENDING_APPROVAL";
  const isPendingPayment = status === "PENDING_PAYMENT";
  const isRejected = status === "REJECTED";
  const isActive = status === "ACTIVE";

  const handleRenew = async () => {
    if (!renewPlanId) {
      toast.error("Vui lòng chọn gói để gia hạn.");
      return;
    }
    setIsRenewing(true);
    try {
      const planId = Number(renewPlanId);
      // EXPIRED → POST /subscriptions/late-renewal, ACTIVE → POST /subscriptions/early-renewal
      const res = isExpired
        ? await lateRenewalSubscription({ planId })
        : await earlyRenewalSubscription({ planId });
      if (res?.paymentUrl) {
        // Thanh toán sớm: thuê bao vẫn ACTIVE trong lúc trả tiền → lưu ngày hết hạn hiện tại
        // để trang kết quả nhận biết khi nào kỳ mới được cộng thật sự.
        try {
          if (isActive && profile.endDate) {
            sessionStorage.setItem(RENEWAL_BASELINE_KEY, profile.endDate);
          } else {
            sessionStorage.removeItem(RENEWAL_BASELINE_KEY);
          }
        } catch {
          // sessionStorage không khả dụng → trang kết quả dùng cách kiểm tra mặc định
        }
        toast.success("Đang chuyển hướng sang cổng thanh toán Stripe...");
        window.location.href = res.paymentUrl;
        return;
      }
      toast.error("Không nhận được đường dẫn thanh toán từ hệ thống.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể tạo phiên thanh toán gia hạn.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleResubmit = async () => {
    setIsResubmitting(true);
    try {
      // Gọi OpenAPI: POST /api/v1/user/subscriptions/resubmit
      const res = await resubmitSubscription();
      toast.success(res.message || "Đã gửi lại yêu cầu Subscription để SaaS Admin xét duyệt.");
      onChanged();
    } catch (err: any) {
      toast.error(err?.message || "Không thể gửi lại yêu cầu.");
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    setIsRetryingPayment(true);
    try {
      // Gọi OpenAPI: POST /api/v1/user/subscriptions/retry-payment
      const res = await retryInitialPayment();
      if (res?.checkoutUrl) {
        toast.success("Đang chuyển hướng sang cổng thanh toán Stripe...");
        window.location.href = res.checkoutUrl;
        return;
      }
      toast.success(res?.message || "Đã tạo phiên thanh toán mới và gửi link qua email.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể khởi tạo phiên thanh toán Stripe.");
    } finally {
      setIsRetryingPayment(false);
    }
  };

  if (!status) {
    return (
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Bạn chưa đăng ký gói dịch vụ nào</h3>
        <p className="text-xs text-slate-500">Chọn một gói và gửi yêu cầu để SaaS Admin xét duyệt.</p>
        <Link
          href="/owner/subscribe"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
        >
          <span>Đăng ký gói dịch vụ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Current Plan Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
                Thuê Bao Hiện Tại
              </span>
              <StatusBadge type="subscription" status={status} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{profile.tenantName || profile.userName}</h2>
            <p className="text-xs text-slate-400">{profile.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isPendingPayment && (
              <button
                onClick={handleRetryPayment}
                disabled={isRetryingPayment}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isRetryingPayment ? "Đang xử lý..." : "Thanh toán Stripe (Retry)"}</span>
              </button>
            )}

            {isRejected && (
              <button
                onClick={handleResubmit}
                disabled={isResubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isResubmitting ? "Đang gửi..." : "Gửi lại yêu cầu xét duyệt"}</span>
              </button>
            )}

            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-xl border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Chờ SaaS Admin duyệt</span>
              </span>
            )}

            {(isActive || isExpired) && (
              <button
                onClick={() => setIsRenewDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isExpired ? "Gia hạn thuê bao" : "Thanh toán sớm kỳ tiếp theo"}</span>
              </button>
            )}

            <Link
              href="/owner/subscription/payments"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200"
            >
              <span>Lịch sử thanh toán</span>
            </Link>
          </div>
        </div>

        {/* Plan Dates & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              Chủ tài khoản
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white">{profile.userName}</div>
            <span className="text-[11px] text-slate-400">{profile.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Ngày bắt đầu
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {profile.startDate ? <DateText date={profile.startDate} /> : "—"}
            </div>
            <span className="text-[11px] text-slate-400">Chỉ có khi thuê bao đang hoạt động</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Ngày kết thúc kỳ hạn
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {profile.endDate ? <DateText date={profile.endDate} /> : "—"}
            </div>
            <span className={`text-[11px] font-medium ${isExpired ? "text-rose-500" : isActive ? "text-emerald-500" : "text-slate-400"}`}>
              {isExpired ? "Đã hết hạn sử dụng" : isActive ? "Đang có hiệu lực" : "Chưa kích hoạt"}
            </span>
          </div>
        </div>
      </div>

      {/* Resource Usage Limits */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mức Độ Sử Dụng Tài Nguyên So Với Giới Hạn Gói</h3>
          </div>
          <Link
            href="/owner/subscribe"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Nâng cấp gói</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <UsageMeter
            label="Số Khách Sạn (Properties)"
            current={usage?.properties?.current || 1}
            max={usage?.properties?.max || 3}
          />
          <UsageMeter
            label="Tổng Số Phòng (Rooms)"
            current={usage?.rooms?.current || 22}
            max={usage?.rooms?.max || 50}
          />
          <UsageMeter
            label="Tài Khoản Nhân Viên (Users)"
            current={usage?.users?.current || 3}
            max={usage?.users?.max || 10}
          />
          <UsageMeter
            label="Lưu Trữ Tệp (Storage)"
            current={usage?.storage?.current || 157286400}
            max={usage?.storage?.max || 5368709120}
            formatValue={(b) => formatBytes(b)}
          />
        </div>
      </div>

      {/* Reminders List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thông Báo Nhắc Hạn Thuê Bao ({reminders.length})</h3>
        </div>

        {reminders.length === 0 ? (
          <div className="text-xs text-slate-400 py-3 italic">Không có thông báo nhắc hạn nào gần đây.</div>
        ) : (
          <div className="space-y-2.5">
            {reminders.map((r, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Nhắc gia hạn kỳ thuê bao #{r.subscription_id}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Kênh gửi: <span className="uppercase font-semibold">{r.channel || "EMAIL"}</span> • Trạng thái:{" "}
                      <span className="text-emerald-600 font-semibold">{r.status || "SENT"}</span>
                    </div>
                  </div>
                </div>
                <DateText date={r.sent_at || r.created_at} type="datetime" className="text-[11px] text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {isRenewDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isExpired ? "Gia hạn muộn (thuê bao đã hết hạn)" : "Thanh toán sớm cho kỳ kế tiếp"}
            </h3>
            <p className="text-xs text-slate-500">
              {isExpired
                ? "Kỳ mới bắt đầu tính từ ngày thanh toán thành công."
                : `Kỳ mới bắt đầu ngay sau ngày kết thúc hiện tại${profile.endDate ? ` (${profile.endDate})` : ""}. Bạn có thể chọn gói khác cho kỳ kế tiếp.`}
            </p>
            <select
              value={renewPlanId}
              onChange={(e) => setRenewPlanId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price.toLocaleString("vi-VN")} đ / {p.duration} {durationUnitLabel(p.duration_unit)}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRenewDialogOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl dark:bg-slate-800 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={handleRenew}
                disabled={isRenewing}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl"
              >
                {isRenewing ? "Đang xử lý..." : "Tiếp tục thanh toán Stripe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
