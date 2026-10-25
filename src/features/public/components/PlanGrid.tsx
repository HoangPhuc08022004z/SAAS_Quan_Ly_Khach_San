import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Plan } from "@/lib/api/types";
import { formatMoney } from "@/lib/utils/money";
import { formatBytes } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function PlanLimitList({ plan }: { plan: Plan }) {
  const limits = [
    `Tối đa ${plan.max_properties} khách sạn`,
    `Tối đa ${plan.max_rooms} phòng nghỉ`,
    `Tối đa ${plan.max_users} tài khoản nhân viên`,
    `Dung lượng lưu trữ ${formatBytes(plan.max_storage)}`,
    "Đầy đủ nghiệp vụ Lễ tân, Đặt phòng & Buồng phòng",
    plan.name.includes("Premium") ? "Trợ lý AI Chatbot RAG không giới hạn" : "Trợ lý AI Chatbot tiêu chuẩn",
  ];

  return (
    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
      {limits.map((lim, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mt-0.5">
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </div>
          <span>{lim}</span>
        </li>
      ))}
    </ul>
  );
}

export function PlanCard({ plan, isPopular }: { plan: Plan; isPopular?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col w-full rounded-2xl border p-6 bg-white shadow-sm transition-all hover:shadow-lg dark:bg-slate-900",
        isPopular
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10"
          : "border-slate-200/80 dark:border-slate-800"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
          Khuyên dùng nhiều nhất
        </div>
      )}

      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px] line-clamp-2">
          {plan.description}
        </p>
      </div>

      <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatMoney(plan.price)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            /{plan.duration_unit === "MONTH" ? "tháng" : plan.duration_unit === "YEAR" ? "năm" : "ngày"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        <PlanLimitList plan={plan} />
      </div>

      <div className="mt-6 pt-4">
        <Link
          href={`/owner/subscribe?planId=${plan.id}`}
          className={cn(
            "flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm",
            isPopular
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          )}
        >
          <span>Đăng ký gói này</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function PlanGrid({ plans }: { plans: Plan[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
      {plans.map((p) => (
        <div key={p.id} className="w-full md:w-[calc(33.333%-1rem)] flex">
          <PlanCard plan={p} isPopular={p.id === "plan_standard"} />
        </div>
      ))}
    </div>
  );
}
