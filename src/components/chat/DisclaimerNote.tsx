import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DisclaimerNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-amber-50/80 px-2.5 py-1.5 text-[11px] text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300",
        className
      )}
    >
      <Info className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span>
        <strong>Lưu ý:</strong> Thông tin AI chỉ hỗ trợ tra cứu đối chiếu, không thay thế báo cáo tài chính chính thức.
      </span>
    </div>
  );
}
