"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CountdownProps {
  initialSeconds?: number;
  deadlineIso?: string;
  onExpire?: () => void;
  className?: string;
}

export function Countdown({
  initialSeconds = 900,
  deadlineIso,
  onExpire,
  className,
}: CountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (deadlineIso) {
      const diff = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
      return diff;
    }
    return initialSeconds;
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formatted =
    hours > 0
      ? `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isLow = secondsLeft < 180; // under 3 mins

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tabular-nums border",
        isLow
          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 animate-pulse"
          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
        className
      )}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{formatted}</span>
    </div>
  );
}
