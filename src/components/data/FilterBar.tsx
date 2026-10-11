"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  statusOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (val: string) => void;
  children?: React.ReactNode;
  onClear?: () => void;
  className?: string;
}

export function FilterBar({
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearchChange,
  statusOptions,
  statusValue = "",
  onStatusChange,
  children,
  onClear,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(searchValue || (statusValue && statusValue !== "ALL"));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[240px]">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-800"
            />
          </div>
        )}

        {/* Status Dropdown */}
        {statusOptions && onStatusChange && (
          <select
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Extra filters */}
        {children}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Đặt lại bộ lọc</span>
        </button>
      )}
    </div>
  );
}
