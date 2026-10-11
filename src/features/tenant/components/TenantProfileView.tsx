"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/data/StatusBadge";
import { formatBytes } from "@/lib/utils/format";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Save, Shield, CheckCircle, Info } from "lucide-react";

export function TenantProfileView({ initialTenant }: { initialTenant: any }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(initialTenant);
  const [name, setName] = useState(initialTenant?.name || "");
  const [description, setDescription] = useState(initialTenant?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên tổ chức không được để trống.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await api.updateMyTenant({
        name: name.trim(),
        description: description.trim(),
      });
      setTenant(updated);
      toast.success("Đã cập nhật thông tin tổ chức thành công!");
      router.refresh();
    } catch {
      toast.error("Không thể lưu thông tin tổ chức.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status & ID Summary Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{tenant?.name}</h2>
              <StatusBadge type="tenant" status={tenant?.status} />
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {tenant?.id}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Tenant cách ly hoàn toàn theo chuẩn đa thuê bao (Multi-tenant)</span>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cập Nhật Hồ Sơ Tổ Chức</h3>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên tổ chức / Tập đoàn khách sạn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả thông tin</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu chuỗi khách sạn, địa chỉ trụ sở chính..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Read-only Plan Quota Information */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hạn mức tài nguyên được cấp theo gói hiện tại:</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Khách sạn tối đa</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{tenant?.max_properties} khách sạn</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Tổng số phòng</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{tenant?.max_rooms} phòng</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Tài khoản nhân viên</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{tenant?.max_users} tài khoản</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Dung lượng lưu trữ</span>
              <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatBytes(tenant?.max_storage || 5368709120)}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
