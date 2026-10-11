"use client";

import React, { useState } from "react";
import { LogOut, CheckCircle2, ShieldAlert } from "lucide-react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface CheckoutCompleteButtonProps {
  reservationId: string;
  reservationCode: string;
  canCheckOut: boolean;
  balance: number;
  onSuccess: () => void;
}

export function CheckoutCompleteButton({
  reservationId,
  reservationCode,
  canCheckOut,
  balance,
  onSuccess,
}: CheckoutCompleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirmCheckout() {
    try {
      setIsSubmitting(true);
      await api.checkOut(reservationId);
      toast.success(
        `Hoàn tất trả phòng cho đơn ${reservationCode}. Các phòng đã chuyển sang trạng thái Cần dọn (VACANT_DIRTY)!`
      );
      setShowConfirm(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Không thể hoàn tất trả phòng");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-muted/40 border rounded-xl">
        <div className="text-xs text-muted-foreground">
          {canCheckOut ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Đã thỏa mãn mọi điều kiện trả phòng: Công nợ = 0 đ.
            </span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Chưa thể hoàn tất Check-out: Công nợ hiện tại là {balance.toLocaleString("vi-VN")} đ. Vui lòng tất toán về 0 đ.
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!canCheckOut || isSubmitting}
          onClick={() => setShowConfirm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          title={!canCheckOut ? "Chỉ bật khi công nợ bằng 0 đ" : "Hoàn tất thủ tục trả phòng"}
        >
          <LogOut className="w-4 h-4" />
          Hoàn tất trả phòng & Bàn giao
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmCheckout}
        title="Xác nhận hoàn tất thủ tục Check-out?"
        description={`Bạn có chắc chắn muốn trả phòng cho đơn ${reservationCode}? Hệ thống sẽ giải phóng phòng và tự động chuyển các phòng sang trạng thái Bẩn (VACANT_DIRTY) để chuyển tiếp cho bộ phận buồng phòng.`}
        confirmText={isSubmitting ? "Đang xử lý..." : "Xác nhận trả phòng"}
      />
    </div>
  );
}
