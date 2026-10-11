"use client";

import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ReasonDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ReasonDialog({
  isOpen,
  title,
  description,
  reasonLabel = "Lý do bắt buộc",
  reasonPlaceholder = "Nhập lý do thực hiện thao tác này...",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  onClose,
}: ReasonDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự).");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
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

        {description && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {reasonLabel} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder={reasonPlaceholder}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className={cn(
                "px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2",
                variant === "destructive"
                  ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                (isLoading || !reason.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading ? "Đang xử lý..." : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
