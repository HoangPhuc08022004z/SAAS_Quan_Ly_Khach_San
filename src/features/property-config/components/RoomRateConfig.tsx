"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoneyText } from "@/components/data/MoneyText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Save, ArrowLeft, Tag, Info } from "lucide-react";

export function RoomRateConfig({
  roomType,
  initialRate,
}: {
  roomType: any;
  initialRate: any;
}) {
  const [rate, setRate] = useState(initialRate);
  const [rateName, setRateName] = useState(initialRate?.name || "Giá Tiêu Chuẩn 1 Đêm");
  const [price, setPrice] = useState<number>(initialRate?.price || 1200000);
  const [description, setDescription] = useState(initialRate?.description || "Bao gồm ăn sáng buffet và VAT");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateName.trim() || price <= 0) {
      toast.error("Vui lòng nhập tên mức giá và mức giá hợp lệ (> 0).");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.setRoomRate(roomType.id, {
        name: rateName.trim(),
        price: Number(price),
        description: description.trim(),
      });
      setRate(updated);
      toast.success("Đã cập nhật bảng giá phòng thành công!");
    } catch {
      toast.error("Không thể lưu giá phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${roomType.property_id}/room-types`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách loại phòng</span>
        </Link>
      </div>

      {/* Current Rate Card */}
      {rate && (
        <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Mức giá đang áp dụng
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rate.name}</h4>
              <p className="text-xs text-slate-500">{rate.description}</p>
            </div>
          </div>
          <div className="text-right">
            <MoneyText amount={rate.price} className="text-lg font-black text-emerald-600" />
            <div className="text-[11px] text-slate-400">/ đêm lưu trú</div>
          </div>
        </div>
      )}

      {/* Set Rate Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thiết Lập Giá Phòng: {roomType.name}</h3>
            <p className="text-xs text-slate-400">Giá phòng dùng để tính cọc và thanh toán tiền phòng khi đặt phòng</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Tên gói mức giá <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={rateName}
              onChange={(e) => setRateName(e.target.value)}
              placeholder="Ví dụ: Giá Tiêu Chuẩn (Standard Daily Rate)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Mức giá niêm yết mỗi đêm (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="10000"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Mô tả và quyền lợi đi kèm</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Miễn phí trà, cafe, 2 chai nước khoáng mỗi ngày..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu bảng giá"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
