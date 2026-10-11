"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FnbItem, Reservation, Guest } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Utensils,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ShoppingBag,
  Send,
  Calculator,
} from "lucide-react";

type ExtendedReservation = Reservation & { guest?: Guest };

interface OrderNewViewProps {
  initialItems: FnbItem[];
  initialReservations: ExtendedReservation[];
}

export function OrderNewView({
  initialItems,
  initialReservations,
}: OrderNewViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryItemId = searchParams.get("itemId");

  const [reservations] = useState(initialReservations);
  const [items] = useState(initialItems);

  const [selectedResId, setSelectedResId] = useState(
    reservations.find((r) => r.status === "CHECKED_IN")?.id || reservations[0]?.id || ""
  );
  const [selectedItemId, setSelectedItemId] = useState(
    queryItemId || items.find((i) => i.status === "ACTIVE")?.id || items[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentItem = items.find((i) => i.id === selectedItemId);
  const currentReservation = reservations.find((r) => r.id === selectedResId);

  const remaining = currentItem ? Math.max(0, currentItem.max_quantity - currentItem.actual_quantity) : 0;
  const totalAmount = currentItem ? quantity * currentItem.selling_price : 0;

  // Business rule: orders above 10 units require Manager approval first
  const requiresApproval = quantity > 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedResId || !selectedItemId || !currentItem) {
      toast.error("Vui lòng chọn đặt phòng và món ăn");
      return;
    }

    if (quantity <= 0) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }

    if (quantity > remaining) {
      toast.error(`Số lượng đặt (${quantity}) vượt quá số lượng còn lại trong ngày (${remaining} phần).`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (requiresApproval) {
        if (!reason.trim()) {
          toast.error("Đơn hàng số lượng lớn (> 10 phần) cần nhập lý do để Quản lý phê duyệt.");
          setIsSubmitting(false);
          return;
        }

        await api.createFnbRequest({
          fnb_menu_id: currentItem.id,
          quantity,
          reason: `Đặt cho phòng ${currentReservation?.code || selectedResId}: ${reason.trim()}`,
        });

        toast.success(
          "Đơn hàng lớn đã được chuyển sang Hàng đợi Phê duyệt F&B của Quản lý."
        );
        router.push("/pms/fnb/approvals");
      } else {
        await api.createFnbOrder(selectedResId, {
          fnb_menu_id: currentItem.id,
          quantity,
        });

        toast.success(
          `Đã tạo đơn món "${currentItem.name}" (${quantity} phần) và tự động ghi vào Folio của phòng!`
        );
        router.push(`/pms/checkout?reservationId=${selectedResId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Không thể hoàn tất đặt món");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pms/fnb/menu"
          className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Đặt món F&B tại phòng
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lập phiếu phục vụ món ăn cho khách đang lưu trú và tự động ghi nhận vào Folio
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border bg-card shadow-sm space-y-5">
        {/* Reservation Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Chọn phòng / Đơn đặt phòng đang lưu trú <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedResId}
            onChange={(e) => setSelectedResId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-medium"
            required
          >
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} - {r.guest?.full_name || "Khách lẻ"} ({r.status})
              </option>
            ))}
          </select>
        </div>

        {/* Item Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            Chọn món ẩm thực <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedItemId}
            onChange={(e) => {
              setSelectedItemId(e.target.value);
              setQuantity(1);
            }}
            className="w-full px-3 py-2.5 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-medium"
            required
          >
            {items.map((i) => {
              const rem = i.max_quantity - i.actual_quantity;
              return (
                <option key={i.id} value={i.id} disabled={rem <= 0 || i.status !== "ACTIVE"}>
                  {i.name} - {i.selling_price.toLocaleString("vi-VN")} đ (Còn {rem} suất)
                </option>
              );
            })}
          </select>
        </div>

        {/* Quantity Stepper */}
        {currentItem && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Số lượng đặt
              </label>
              <span className="text-xs text-muted-foreground">
                Hạn mức còn lại: <strong className="text-foreground">{remaining} phần</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={remaining}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(remaining, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 text-center text-sm font-bold bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(remaining, q + 1))}
                  disabled={quantity >= remaining}
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                Đơn giá bán: <strong className="text-foreground"><MoneyText amount={currentItem.selling_price} /></strong>
              </div>
            </div>
          </div>
        )}

        {/* Warning if large order requires manager approval */}
        {requiresApproval && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Đơn hàng vượt ngưỡng 10 phần - Cần Quản lý duyệt trước khi giao
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Lý do yêu cầu số lượng lớn <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Khách đoàn đặt tiệc trưa phòng VIP..."
                className="w-full px-3 py-2 text-xs bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        {/* Price Preview Card */}
        <div className="p-4 rounded-xl bg-muted/40 border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calculator className="w-4 h-4 text-primary" />
            <span>Tổng cộng thành tiền:</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            <MoneyText amount={totalAmount} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t">
          <Link
            href="/pms/fnb/menu"
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Hủy bỏ
          </Link>

          <button
            type="submit"
            disabled={isSubmitting || remaining <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? (
              "Đang xử lý..."
            ) : requiresApproval ? (
              <>
                <Send className="w-4 h-4" />
                Gửi yêu cầu phê duyệt
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận đặt & Ghi Folio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
