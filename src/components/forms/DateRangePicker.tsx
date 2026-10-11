"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  minDate?: string;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={startDate}
          min={minDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>
      <span className="text-xs text-slate-400 font-medium">đến</span>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={endDate}
          min={startDate || minDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>
    </div>
  );
}
