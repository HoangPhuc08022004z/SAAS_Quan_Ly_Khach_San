"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Clock, Save } from "lucide-react";

export function CheckTimeForm({
  propertyId,
  initialTimes,
}: {
  propertyId: string;
  initialTimes: { check_in_time: string; check_out_time: string };
}) {
  const router = useRouter();
  const [checkInTime, setCheckInTime] = useState(initialTimes.check_in_time || "14:00");
  const [checkOutTime, setCheckOutTime] = useState(initialTimes.check_out_time || "12:00");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateCheckTimes(propertyId, {
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
      });
      toast.success("Đã cập nhật khung giờ nhận / trả phòng thành công!");
      router.refresh();
    } catch {
      toast.error("Không thể lưu cấu hình giờ nhận/trả phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quy Định Giờ Nhận & Trả Phòng</h3>
            <p className="text-xs text-slate-400">Áp dụng làm mốc mặc định cho toàn bộ các đơn đặt phòng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Giờ nhận phòng tiêu chuẩn (Check-in) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Giờ trả phòng tiêu chuẩn (Check-out) <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200 space-y-1">
          <span className="font-bold">Quy tắc nghiệp vụ:</span>
          <p className="text-[11px] opacity-80 leading-relaxed">
            Khoảng thời gian giữa giờ trả phòng ({checkOutTime}) và giờ nhận phòng ({checkInTime}) là thời gian để bộ phận Buồng phòng thực hiện dọn dẹp và kiểm tra phòng sẵn sàng đón khách kế tiếp.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu khung giờ"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
