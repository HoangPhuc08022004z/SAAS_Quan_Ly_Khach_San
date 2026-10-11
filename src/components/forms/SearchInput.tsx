"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localVal !== value) onChange(localVal);
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [localVal, debounceMs, onChange, value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
      {localVal && (
        <button
          type="button"
          onClick={() => {
            setLocalVal("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
