import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  description?: string;
  status?: "success" | "warning" | "error" | "info" | "default";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800", className)}>
      {events.map((e) => (
        <div key={e.id} className="relative group">
          <div
            className={cn(
              "absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700",
              e.status === "success" && "bg-emerald-500",
              e.status === "warning" && "bg-amber-500",
              e.status === "error" && "bg-rose-500",
              e.status === "info" && "bg-blue-500"
            )}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{e.title}</h4>
            <span className="text-xs text-slate-400 tabular-nums">{e.time}</span>
          </div>
          {e.description && (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{e.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
