import React from "react";
import { Loader2 } from "lucide-react";

export function AsyncBoundary({
  loading,
  error,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center justify-between gap-3 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
        <span>{error}</span>
        {onRetry && (
          <button onClick={onRetry} className="font-bold underline">
            Thử lại
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
