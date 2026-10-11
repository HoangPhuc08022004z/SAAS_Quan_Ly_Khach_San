import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  message: string;
  traceId?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message,
  traceId,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20",
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">{title}</h3>
      <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">{message}</p>
      {traceId && (
        <p className="mt-2 font-mono text-[11px] text-rose-500/80 dark:text-rose-400/60">
          Mã định danh (Trace ID): {traceId}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Thử lại</span>
        </button>
      )}
    </div>
  );
}
