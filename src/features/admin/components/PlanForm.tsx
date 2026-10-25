"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "@/lib/api/types";
import { createSubscriptionPlan, updateSubscriptionPlan } from "@/lib/api";
import { FormField } from "@/components/forms/FormField";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { bytesToMB, mbToBytes } from "@/lib/utils/format";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

interface PlanFormProps {
  initialPlan?: Plan;
}

export function PlanForm({ initialPlan }: PlanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(initialPlan?.name || "");
  const [description, setDescription] = useState(initialPlan?.description || "");
  const [price, setPrice] = useState(initialPlan?.price || 1000000);
  const [duration, setDuration] = useState(initialPlan?.duration || 1);
  const [durationUnit, setDurationUnit] = useState<"DAY" | "MONTH" | "YEAR">(initialPlan?.duration_unit || "MONTH");
  const [maxProperties, setMaxProperties] = useState(initialPlan?.max_properties || 1);
  const [maxRooms, setMaxRooms] = useState(initialPlan?.max_rooms || 20);
  const [maxUsers, setMaxUsers] = useState(initialPlan?.max_users || 5);
  const [storageMB, setStorageMB] = useState(initialPlan ? bytesToMB(initialPlan.max_storage) : 2048);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên gói dịch vụ.");
      return;
    }

    setIsLoading(true);
    try {
      const openApiPayload = {
        name,
        description,
        price: Number(price),
        duration: Number(duration),
        durationUnit,
        maxUsers: Number(maxUsers),
        maxProperties: Number(maxProperties),
        maxRooms: Number(maxRooms),
        maxStorage: mbToBytes(Number(storageMB)), // backend lưu bytes
      };

      if (initialPlan) {
        // Gọi OpenAPI: PUT /api/v1/saas/admin/Plan/{planId}
        await updateSubscriptionPlan(Number(initialPlan.id), openApiPayload);
        toast.success("Cập nhật gói dịch vụ thành công!");
      } else {
        // Gọi OpenAPI: POST /api/v1/saas/admin/createPlan (Plan mới luôn ACTIVE)
        await createSubscriptionPlan(openApiPayload);
        toast.success("Tạo gói dịch vụ mới thành công!");
      }
      router.push("/admin/plans");
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi lưu gói dịch vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Tên gói dịch vụ" required className="sm:col-span-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Gói Tiêu Chuẩn (Standard)"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <FormField label="Mô tả chi tiết" className="sm:col-span-2">
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả đối tượng khách hàng và giá trị cốt lõi..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </FormField>

        <FormField label="Giá niêm yết (VND)" required>
          <MoneyInput value={price} onChange={setPrice} />
        </FormField>

        <div className="grid grid-cols-2 gap-2">
          <FormField label="Thời hạn" required>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </FormField>
          <FormField label="Đơn vị" required>
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="DAY">Ngày</option>
              <option value="MONTH">Tháng</option>
              <option value="YEAR">Năm</option>
            </select>
          </FormField>
        </div>

        <FormField label="Giới hạn số khách sạn (max_properties)" required>
          <input
            type="number"
            min={1}
            value={maxProperties}
            onChange={(e) => setMaxProperties(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        </FormField>

        <FormField label="Giới hạn số phòng (max_rooms)" required>
          <input
            type="number"
            min={1}
            value={maxRooms}
            onChange={(e) => setMaxRooms(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        </FormField>

        <FormField label="Số nhân viên tối đa (max_users)" required>
          <input
            type="number"
            min={1}
            value={maxUsers}
            onChange={(e) => setMaxUsers(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        </FormField>

        <FormField label="Dung lượng lưu trữ (MB)" hint={`${(storageMB / 1024).toFixed(1)} GB`} required>
          <input
            type="number"
            min={100}
            value={storageMB}
            onChange={(e) => setStorageMB(parseInt(e.target.value, 10) || 1024)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        </FormField>

      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => router.push("/admin/plans")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{initialPlan ? "Lưu thay đổi" : "Tạo gói dịch vụ"}</span>
        </button>
      </div>
    </form>
  );
}
