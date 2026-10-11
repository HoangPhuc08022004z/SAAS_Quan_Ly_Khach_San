"use client";

import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NumberStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  disabled,
  className,
}: NumberStepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) onChange(value - step);
  };

  const handleIncrement = () => {
    if (value + step <= max) onChange(value + step);
  };

  return (
    <div className={cn("inline-flex items-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900", className)}>
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 rounded-l-lg dark:hover:bg-slate-800 dark:text-slate-400"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= min && val <= max) onChange(val);
        }}
        className="h-9 w-14 text-center text-sm font-semibold tabular-nums border-x border-slate-200 bg-transparent focus:outline-none dark:border-slate-800 dark:text-white"
      />
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 rounded-r-lg dark:hover:bg-slate-800 dark:text-slate-400"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
