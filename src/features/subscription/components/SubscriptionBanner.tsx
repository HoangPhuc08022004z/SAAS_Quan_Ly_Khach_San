"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth/use-session";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

export function SubscriptionBanner() {
  const { subscription, isSubscriptionExpired, isTenantSuspended } = useSession();

  if (!subscription) return null;

  if (isTenantSuspended || isSubscriptionExpired) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">
            Gói thuê bao của bạn đã hết hạn hoặc tổ chức bị khóa tạm thời. Các phân hệ vận hành PMS đang bị chặn.
          </span>
        </div>
        <Link
          href="/owner/subscription"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
        >
          <span>Gia hạn ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Check if expiring soon (< 7 days)
  const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
  const refDate = new Date("2026-10-11");
  const diffDays = endDate ? Math.ceil((endDate.getTime() - refDate.getTime()) / (1000 * 3600 * 24)) : 999;

  if (diffDays <= 7 && diffDays > 0) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold">
            Gói dịch vụ của bạn sẽ hết hạn sau {diffDays} ngày nữa (ngày {subscription.end_date?.slice(0, 10)}). Hãy gia hạn sớm để tránh gián đoạn dịch vụ.
          </span>
        </div>
        <Link
          href="/owner/subscription"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
        >
          <span>Gia hạn gói</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}
