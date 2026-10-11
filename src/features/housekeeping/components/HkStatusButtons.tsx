"use client";

import React from "react";
import { Room } from "@/lib/api/types";
import { Sparkles, CheckCircle2, AlertOctagon, Wrench } from "lucide-react";

interface HkStatusButtonsProps {
  currentStatus: Room["status"];
  onUpdateStatus: (newStatus: Room["status"]) => void;
  disabled?: boolean;
}

export function HkStatusButtons({
  currentStatus,
  onUpdateStatus,
  disabled = false,
}: HkStatusButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {currentStatus !== "CLEANING" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdateStatus("CLEANING")}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Đang dọn
        </button>
      )}

      {currentStatus !== "READY" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdateStatus("READY")}
          className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Sẵn sàng
        </button>
      )}

      {currentStatus !== "VACANT_DIRTY" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdateStatus("VACANT_DIRTY")}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Báo bẩn
        </button>
      )}

      {currentStatus !== "MAINTENANCE" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdateStatus("MAINTENANCE")}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-all active:scale-95 disabled:opacity-50"
          title="Bảo trì"
        >
          <Wrench className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
