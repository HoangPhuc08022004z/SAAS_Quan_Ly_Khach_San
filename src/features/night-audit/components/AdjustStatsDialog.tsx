"use client";

import React, { useState } from "react";
import { Edit3, X, AlertTriangle } from "lucide-react";
import { DailyStatistics } from "@/lib/api/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AdjustStatsDialogProps {
  stats: DailyStatistics;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustStatsDialog({
  stats,
  isOpen,
  onClose,
  onSuccess,
}: AdjustStatsDialogProps) {
  const [field, setField] = useState<string>("total_guests");
  const [newValue, setNewValue] = useState<number>(stats.total_guests);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const fieldOptions = [
    { key: "total_guests", label: "Tổng số khách lưu trú", current: stats.total_guests },
    { key: "occupied_rooms", label: "Số phòng có khách (Occupied)", current: stats.occupied_rooms },
    { key: "successful_reservations", label: "Đặt phòng thành công", current: stats.successful_reservations },
    { key: "deposit_collected", label: "Tiền cọc đã thu (VND)", current: stats.deposit_collected },
    { key: "expected_room_revenue", label: "Doanh thu phòng (VND)", current: stats.expected_room_revenue },
    { key: "fnb_revenue", label: "Doanh thu F&B (VND)", current: stats.fnb_revenue },
    { key: "fnb_cost", label: "Chi phí nguyên liệu F&B (VND)", current: stats.fnb_cost },
  ];

  function handleFieldChange(f: string) {
    setField(f);
    const item = fieldOptions.find((o) => o.key === f);
    if (item) {
      setNewValue(item.current);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Lý do điều chỉnh số liệu bắt buộc và phải có ít nhất 5 ký tự.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.adjustDailyStats(stats.id, {
        field,
        newValue,
        adjustmentReason: reason.trim(),
      });
      toast.success("Đã ghi nhận điều chỉnh số liệu thống kê thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Không thể điều chỉnh số liệu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-primary">
            <Edit3 className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">
              Điều chỉnh số liệu chốt ngày
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
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Chỉ số cần điều chỉnh <span className="text-rose-500">*</span>
            </label>
            <select
              value={field}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {fieldOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} (Hiện tại: {opt.current.toLocaleString("vi-VN")})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Giá trị mới <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={newValue}
              onChange={(e) => setNewValue(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Lý do điều chỉnh (Bắt buộc theo BR-OP-53) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Sai sót nhập liệu ca tối, bổ sung đoàn khách phát sinh..."
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              required
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Mọi điều chỉnh đều được lưu vào nhật ký kiểm toán hệ thống.
            </span>
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
              {isSubmitting ? "Đang lưu..." : "Xác nhận điều chỉnh"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
