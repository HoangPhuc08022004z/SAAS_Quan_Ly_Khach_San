import React from "react";
import { cn } from "@/lib/utils/cn";
import * as Icons from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  iconName?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isUp?: boolean;
    label?: string;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, iconName, icon, trend, className }: StatCardProps) {
  // @ts-expect-error dynamic lookup
  const IconComponent = iconName ? Icons[iconName] : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        {(icon || IconComponent) && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            {icon ? icon : IconComponent ? React.createElement(IconComponent, { className: "h-5 w-5" }) : null}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              trend.isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend.isUp ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
