"use client";

import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AddIssueDialogProps {
  roomId: string;
  roomNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddIssueDialog({
  roomId,
  roomNumber,
  isOpen,
  onClose,
  onSuccess,
}: AddIssueDialogProps) {
  const [issueType, setIssueType] = useState("BROKEN_ITEM");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả sự cố hoặc vật dụng thiếu");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createHkIssue({
        room_id: roomId,
        issue_type: issueType,
        description: description.trim(),
      });
      toast.success(`Đã ghi nhận sự cố cho phòng ${roomNumber}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo ghi nhận sự cố");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">
              Báo sự cố phòng {roomNumber}
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
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Loại sự cố / vấn đề
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="BROKEN_ITEM">Hỏng hóc trang thiết bị</option>
              <option value="MISSING_AMENITY">Thiếu vật dụng / Đồ tiêu hao</option>
              <option value="DEEP_CLEAN_REQUIRED">Cần vệ sinh đặc biệt / vết bẩn nặng</option>
              <option value="LEAKAGE_ODOR">Rò rỉ nước / Mùi lạ</option>
              <option value="OTHER">Vấn đề khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Mô tả chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Vòi sen rỉ nước, thiếu 2 khăn tắm lớn..."
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
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Ghi nhận sự cố"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
