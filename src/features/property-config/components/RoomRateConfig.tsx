"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoneyText } from "@/components/data/MoneyText";
import { roomRateApi, type ApiRoomRate, type RateName } from "@/lib/api";
import { toast } from "sonner";
import { DollarSign, Save, ArrowLeft, Tag, Ban } from "lucide-react";

const RATE_LABELS: Record<RateName, { title: string; hint: string }> = {
  STANDARD_RATE: { title: "Giá tiêu chuẩn (ngày thường)", hint: "Áp dụng cho các đêm trong tuần" },
  WEEKEND_RATE: { title: "Giá cuối tuần", hint: "Áp dụng cho các đêm cuối tuần" },
};

function RateForm({
  propertyId,
  roomTypeId,
  rateName,
  initialRate,
}: {
  propertyId: string;
  roomTypeId: number;
  rateName: RateName;
  initialRate: ApiRoomRate | null;
}) {
  const [rate, setRate] = useState<ApiRoomRate | null>(initialRate);
  const [price, setPrice] = useState<number>(initialRate ? Number(initialRate.price) : 0);
  const [description, setDescription] = useState(initialRate?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const label = RATE_LABELS[rateName];
  const isActive = !!rate && rate.status !== "INACTIVE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(price > 0)) {
      toast.error("Vui lòng nhập mức giá hợp lệ (> 0).");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { roomTypeId, rateName, price: Number(price), description: description.trim() || undefined };
      // Chưa có → POST /room-rates; đã có → PUT /room-rates/{roomRateId}
      const saved = rate
        ? await roomRateApi.update(propertyId, rate.roomRateId, payload)
        : await roomRateApi.create(propertyId, payload);
      setRate(saved);
      toast.success(`Đã lưu ${label.title.toLowerCase()}!`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể lưu giá phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!rate) return;
    try {
      // PATCH /room-rates/{roomRateId}/deactivate
      setRate(await roomRateApi.deactivate(propertyId, rate.roomRateId));
      toast.success("Đã vô hiệu hóa mức giá.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể vô hiệu hóa mức giá này.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{label.title}</h3>
            <p className="text-xs text-slate-400">{label.hint}</p>
          </div>
        </div>
        {rate && (
          <div className="text-right">
            <MoneyText amount={Number(rate.price)} className="text-base font-black text-emerald-600" />
            <div className={`text-[11px] font-bold ${isActive ? "text-emerald-600" : "text-slate-400"}`}>
              {isActive ? "Đang áp dụng" : "Đã vô hiệu hóa"}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 text-xs">
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
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bao gồm ăn sáng buffet và VAT..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        {isActive && (
          <button
            type="button"
            onClick={handleDeactivate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl dark:bg-rose-950/40 dark:text-rose-400"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Vô hiệu hóa</span>
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Đang lưu..." : rate ? "Cập nhật giá" : "Tạo mức giá"}</span>
        </button>
      </div>
    </form>
  );
}

export function RoomRateConfig({
  propertyId,
  roomType,
  initialRates,
}: {
  propertyId: string;
  roomType: any;
  initialRates: ApiRoomRate[];
}) {
  const typeId = Number(roomType.id);
  const rateOf = (name: RateName) =>
    initialRates.find((r) => r.roomTypeId === typeId && r.rateName === name) ?? null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${propertyId}/room-types`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách loại phòng</span>
        </Link>
      </div>

      <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200 flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Loại phòng</span>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{roomType.name}</h4>
          <p className="text-xs text-slate-500">
            Mỗi loại phòng có thể có giá ngày thường và giá cuối tuần. Giá dùng để tính cọc và tiền phòng khi đặt phòng.
          </p>
        </div>
      </div>

      {(["STANDARD_RATE", "WEEKEND_RATE"] as RateName[]).map((name) => (
        <RateForm key={name} propertyId={propertyId} roomTypeId={typeId} rateName={name} initialRate={rateOf(name)} />
      ))}
    </div>
  );
}
