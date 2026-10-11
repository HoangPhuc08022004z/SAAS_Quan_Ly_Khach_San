import React from "react";
import { cn } from "@/lib/utils/cn";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
          <label>
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
        </div>
      )}
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
