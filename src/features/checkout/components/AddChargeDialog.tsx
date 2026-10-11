"use client";

import React, { useState } from "react";
import { PlusCircle, X, Calculator } from "lucide-react";
import { Folio } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AddChargeDialogProps {
  reservationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddChargeDialog({
  reservationId,
  isOpen,
  onClose,
  onSuccess,
}: AddChargeDialogProps) {
  const [chargeType, setChargeType] = useState<Folio["charge_type"]>("SERVICE");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time computed field: form cannot edit amount directly!
  const computedAmount = quantity * unitPrice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Vui lòng nhập nội dung diễn giải khoản phí");
      return;
    }
    if (quantity <= 0 || unitPrice < 0) {
      toast.error("Số lượng phải lớn hơn 0 và đơn giá không âm");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.addFolioCharge(reservationId, {
        charge_type: chargeType,
        description: description.trim(),
        quantity,
        unit_price: unitPrice,
      });
      toast.success("Đã thêm khoản phí vào Folio thành công");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm khoản phí");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2 text-primary">
            <PlusCircle className="w-5 h-5" />
            <h3 className="font-semibold text-foreground">
              Thêm khoản phí vào Folio
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
              Phân loại khoản phí
            </label>
            <select
              value={chargeType}
              onChange={(e) => setChargeType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="SERVICE">Dịch vụ (Giặt là, Spa, Đưa đón...)</option>
              <option value="FNB">Ẩm thực & Minibar</option>
              <option value="ROOM">Tiền phòng phát sinh / Phụ thu</option>
              <option value="OTHER">Khoản thu khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Diễn giải nội dung <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Giặt ủi 2 áo sơ mi, Nước suối minibar..."
              className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Số lượng
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Đơn giá (VND)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Field - Read-only */}
          <div className="p-3 rounded-xl bg-muted/50 border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Calculator className="w-4 h-4 text-primary" />
              <span>Thành tiền tính toán:</span>
            </div>
            <div className="text-base font-bold text-foreground">
              <MoneyText amount={computedAmount} />
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
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : "Ghi vào Folio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
