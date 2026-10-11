"use client";

import React, { useState } from "react";
import { PropertyService, Reservation, Guest } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, X, Calendar, Clock, CheckCircle2 } from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface ServiceRequestDialogProps {
  service: PropertyService | null;
  reservations: ExtendedReservation[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ServiceRequestDialog({
  service,
  reservations,
  isOpen,
  onClose,
  onSuccess,
}: ServiceRequestDialogProps) {
  const [selectedResId, setSelectedResId] = useState(
    reservations.find((r) => r.status === "CHECKED_IN")?.id || reservations[0]?.id || ""
  );
  const [scheduledDate, setScheduledDate] = useState("2026-10-11");
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedResId) {
      toast.error("Vui lòng chọn phòng / đơn đặt phòng phục vụ");
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00Z`;

      await api.createServiceRequest(selectedResId, {
        property_service_id: service!.id,
        scheduled_at: scheduledDateTime,
        notes: notes.trim(),
      } as any);

      toast.success(
        `Đã đặt lịch dịch vụ "${service!.custom_name}". Khoản phí đã tự động được ghi nhận vào Folio phòng!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Không thể đặt lịch dịch vụ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">
              Đặt dịch vụ: {service.custom_name}
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
              Chọn phòng / Khách đang lưu trú <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              {reservations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} - {r.guest?.full_name || "Khách lẻ"} ({r.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Ngày thực hiện
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Giờ hẹn
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Ghi chú thêm cho nhân viên
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Dọn kỹ sàn nhà tắm, thay drap giường mới..."
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Pricing info */}
          <div className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Phí dịch vụ ghi Folio:</span>
            <div className="text-base font-bold text-foreground">
              {service.price > 0 ? (
                <MoneyText amount={service.price} />
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
              )}
            </div>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Đang gửi..." : "Xác nhận đặt lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
