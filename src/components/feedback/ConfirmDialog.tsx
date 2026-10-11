"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "default",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {variant === "destructive" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            ) : null}
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2",
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
