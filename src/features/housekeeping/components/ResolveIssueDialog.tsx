"use client";

import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ExtHkIssue } from "@/lib/api/types";

interface ResolveIssueDialogProps {
  issue: ExtHkIssue | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveIssueDialog({
  issue,
  isOpen,
  onClose,
  onSuccess,
}: ResolveIssueDialogProps) {
  const [resolution, setResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !issue) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!issue) return;
    if (!resolution.trim()) {
      toast.error("Vui lòng nhập phương án xử lý / kết quả");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.resolveHkIssue(issue.id, resolution.trim());
      toast.success("Đã hoàn tất xử lý sự cố buồng phòng");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật xử lý sự cố");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">
              Xử lý sự cố
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-1">
            <div>
              <span className="font-semibold text-muted-foreground">Loại:</span>{" "}
              {issue.issue_type}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Mô tả:</span>{" "}
              {issue.description}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Kết quả / Phương án xử lý <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="VD: Đã thay vòi sen mới, bổ sung đủ 2 khăn..."
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Xác nhận đã xử lý"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
