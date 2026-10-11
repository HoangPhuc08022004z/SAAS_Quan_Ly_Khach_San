import React from "react";
import { cn } from "@/lib/utils/cn";

export interface KeyValueItem {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  columns?: 1 | 2;
  className?: string;
}

export function KeyValueList({ items, columns = 1, className }: KeyValueListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-white text-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900",
        columns === 2 && "grid grid-cols-1 md:grid-cols-2 divide-y-0 gap-x-6 gap-y-3 p-4",
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 px-4 gap-1 sm:gap-4",
            columns === 2 && "px-0 py-1.5"
          )}
        >
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            {item.label}
            {item.hint && <span className="block text-xs text-slate-400">{item.hint}</span>}
          </div>
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-left sm:text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
