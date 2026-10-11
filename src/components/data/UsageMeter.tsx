import React from "react";
import { cn } from "@/lib/utils/cn";

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  className?: string;
  formatValue?: (val: number) => string;
}

export function UsageMeter({
  label,
  current,
  max,
  unit = "",
  className,
  formatValue,
}: UsageMeterProps) {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const isHigh = percent >= 85;
  const isMaxed = percent >= 100;

  const currentFormatted = formatValue ? formatValue(current) : current;
  const maxFormatted = formatValue ? formatValue(max) : max;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400 tabular-nums">
          {currentFormatted} / {maxFormatted} {unit} ({percent}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isMaxed
              ? "bg-rose-500"
              : isHigh
              ? "bg-amber-500"
              : "bg-blue-600 dark:bg-blue-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
