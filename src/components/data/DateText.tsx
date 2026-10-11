import React from "react";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface DateTextProps {
  date: string | Date | null | undefined;
  type?: "date" | "datetime" | "time";
  className?: string;
}

export function DateText({ date, type = "date", className }: DateTextProps) {
  let formatted = "-";
  if (type === "datetime") formatted = formatDateTime(date);
  else if (type === "time") formatted = formatTime(date);
  else formatted = formatDate(date);

  return (
    <span className={cn("text-sm text-slate-600 dark:text-slate-300 tabular-nums", className)}>
      {formatted}
    </span>
  );
}
