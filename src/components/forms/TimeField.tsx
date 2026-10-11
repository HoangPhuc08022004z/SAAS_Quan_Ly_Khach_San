"use client";

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TimeFieldProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimeField({ value, onChange, disabled, className }: TimeFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
    </div>
  );
}
