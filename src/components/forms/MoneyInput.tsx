"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  disabled,
  className,
}: MoneyInputProps) {
  const formattedDisplay = value ? new Intl.NumberFormat("vi-VN").format(value) : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw ? parseInt(raw, 10) : 0);
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={formattedDisplay}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm font-medium tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800",
          className
        )}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <span className="text-xs font-semibold text-slate-400">₫</span>
      </div>
    </div>
  );
}
