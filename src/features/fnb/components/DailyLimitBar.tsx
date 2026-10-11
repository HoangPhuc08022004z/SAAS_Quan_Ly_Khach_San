"use client";

import React from "react";

interface DailyLimitBarProps {
  max: number;
  actual: number;
  className?: string;
}

export function DailyLimitBar({ max, actual, className = "" }: DailyLimitBarProps) {
  const remaining = Math.max(0, max - actual);
  const percentage = max > 0 ? Math.min(100, Math.round((actual / max) * 100)) : 100;

  const isFull = remaining === 0;
  const isWarning = percentage >= 80 && !isFull;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">Hạn mức trong ngày:</span>
        <span
          className={`font-semibold ${
            isFull
              ? "text-rose-500"
              : isWarning
              ? "text-amber-500"
              : "text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isFull
            ? "Hết suất (0 phần)"
            : `Còn lại ${remaining} / ${max} phần`}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isFull
              ? "bg-rose-500"
              : isWarning
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
