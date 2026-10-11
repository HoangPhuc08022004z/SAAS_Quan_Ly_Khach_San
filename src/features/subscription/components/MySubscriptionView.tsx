"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { UsageMeter } from "@/components/data/UsageMeter";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { formatBytes } from "@/lib/utils/format";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCard,
  Calendar,
  Layers,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";

export function MySubscriptionView({
  initialSubscription,
  initialUsage,
  initialReminders,
}: {
  initialSubscription: any;
  initialUsage: any;
  initialReminders: any[];
}) {
  const router = useRouter();
  const [sub, setSub] = useState(initialSubscription);
  const [usage] = useState(initialUsage);
  const [reminders] = useState(initialReminders);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const updated = await api.renewMySubscription();
      setSub((prev: any) => ({ ...prev, end_date: updated.end_date, status: updated.status }));
      setIsRenewDialogOpen(false);
      toast.success("Gia hạn thuê bao thành công! Kỳ hạn mới đã được cộng thêm.");
      router.refresh();
    } catch {
      toast.error("Không thể gia hạn thuê bao vào lúc này.");
    } finally {
      setIsRenewing(false);
    }
  };

  const isExpired = sub.status === "EXPIRED";
  const isPending = sub.status === "PENDING";
  const isActive = sub.status === "ACTIVE";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Current Plan Overview Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
                Gói Hiện Tại
              </span>
              <StatusBadge type="subscription" status={sub.status} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{sub.plan?.name || "Standard Plan"}</h2>
            <p className="text-xs text-slate-400">{sub.plan?.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isPending && (
              <Link
                href="/owner/subscription/pay"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Thanh toán ngay</span>
              </Link>
            )}

            {(isActive || isExpired) && (
              <button
                onClick={() => setIsRenewDialogOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Gia hạn thuê bao</span>
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
              Giá gói thuê bao
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              <MoneyText amount={sub.price || sub.plan?.price || 0} />
            </div>
            <span className="text-[11px] text-slate-400">/{sub.plan?.duration_days || 30} ngày</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Ngày bắt đầu
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              <DateText date={sub.start_date} />
            </div>
            <span className="text-[11px] text-slate-400">Thời điểm kích hoạt</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Ngày kết thúc kỳ hạn
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              <DateText date={sub.end_date} />
            </div>
            <span className={`text-[11px] font-medium ${isExpired ? "text-rose-500" : "text-emerald-500"}`}>
              {isExpired ? "Đã hết hạn sử dụng" : "Đang có hiệu lực"}
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

      <ConfirmDialog
        isOpen={isRenewDialogOpen}
        title="Xác nhận gia hạn gói dịch vụ"
        description={`Bạn có muốn gia hạn gói "${sub.plan?.name}" với mức phí ${sub.price?.toLocaleString()} đ? Kỳ hạn mới sẽ được cộng dồn vào thời gian hết hạn hiện tại.`}
        confirmText="Xác nhận gia hạn"
        isLoading={isRenewing}
        onConfirm={handleRenew}
        onClose={() => setIsRenewDialogOpen(false)}
      />
    </div>
  );
}
