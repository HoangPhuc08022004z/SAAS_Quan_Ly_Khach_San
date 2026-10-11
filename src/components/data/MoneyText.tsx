import React from "react";
import { formatMoney } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";

interface MoneyTextProps {
  amount: number | string | null | undefined;
  className?: string;
  colored?: boolean;
}

export function MoneyText({ amount, className, colored = false }: MoneyTextProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount || 0;
  const isPositive = num > 0;
  const isNegative = num < 0;

  return (
    <span
      className={cn(
        "font-semibold tracking-tight tabular-nums",
        colored && isPositive && "text-emerald-600 dark:text-emerald-400",
        colored && isNegative && "text-rose-600 dark:text-rose-400",
        className
      )}
    >
      {formatMoney(amount)}
    </span>
  );
}
