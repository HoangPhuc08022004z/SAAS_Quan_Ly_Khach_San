import React from "react";
import { STATUS_MAP } from "@/config/status-map";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  type: keyof typeof STATUS_MAP;
  status: string;
  className?: string;
}

export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const group = STATUS_MAP[type];
  const config = group ? group[status] : undefined;

  const label = config?.label || status;
  const styleClasses = config?.className || "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        styleClasses,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
