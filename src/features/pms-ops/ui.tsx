"use client";

// Thành phần dùng chung cho các màn vận hành PMS gọi API thật (check-in, buồng phòng, no-show, hủy/hoàn tiền)
import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth/use-session";
import { cn } from "@/lib/utils/cn";

export const inputCls =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors";
export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50 transition-colors";
export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50 transition-colors";

export const vnd = (n: number | null | undefined) => `${new Intl.NumberFormat("vi-VN").format(Number(n ?? 0))}đ`;

export const todayIso = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Mã khách sạn của nhân viên đang đăng nhập (lấy từ token qua phiên đăng nhập PMS) */
export function usePmsProperty() {
  const { currentPropertyId, property } = useSession();
  return { propertyId: currentPropertyId || property?.id || "", propertyName: property?.name };
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      {children}
    </div>
  );
}

export function ErrorBox({ message }: { message: string | null }) {
  if (!message) return null;
  const forbidden = /403|forbidden|không đủ quyền|chỉ dành cho/i.test(message);
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p>{message}</p>
        {forbidden && <p className="mt-1 text-[11px] opacity-80">Vai trò của tài khoản này chưa được backend cấp quyền cho thao tác này.</p>}
      </div>
    </div>
  );
}

export function NoProperty() {
  return (
    <ErrorBox message="Chưa xác định được khách sạn của tài khoản. Hãy đăng xuất rồi đăng nhập lại bằng tài khoản nhân viên." />
  );
}

export function Spinner({ label = "Đang tải..." }: { label?: string }) {
  return (
    <p className="flex items-center justify-center gap-2 p-6 text-xs text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </p>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5 text-xs">
      <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export function Pill({ tone, children }: { tone: "green" | "amber" | "rose" | "blue" | "slate"; children: React.ReactNode }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
    slate: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  } as const;
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", map[tone])}>{children}</span>;
}

export const reservationTone = (s: string): "green" | "amber" | "rose" | "blue" | "slate" =>
  ({ CONFIRMED: "green", CHECKED_IN: "blue", CHECKED_OUT: "slate", PENDING_PAYMENT: "amber", CANCELLED: "rose", NO_SHOW: "rose", EXPIRED: "slate" } as const)[
    s as "CONFIRMED"
  ] ?? "slate";

export const RESERVATION_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán cọc",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận phòng",
  CHECKED_OUT: "Đã trả phòng",
  CANCELLED: "Đã hủy",
  NO_SHOW: "Vắng mặt (No-show)",
  EXPIRED: "Hết hạn giữ chỗ",
};

export function ReservationStatus({ status }: { status: string }) {
  return <Pill tone={reservationTone(status)}>{RESERVATION_LABEL[status] ?? status}</Pill>;
}
