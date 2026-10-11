import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface InlineAlertProps {
  type?: "info" | "warning" | "error" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function InlineAlert({
  type = "info",
  title,
  children,
  className,
}: InlineAlertProps) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300",
    warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
    error: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300",
  };

  const icons = {
    info: <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />,
  };

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3.5 text-xs leading-relaxed",
        styles[type],
        className
      )}
    >
      <div className="pt-0.5">{icons[type]}</div>
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}
