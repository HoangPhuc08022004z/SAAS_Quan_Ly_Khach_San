"use client";

import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/data/StatusBadge";
import type { UserProfile } from "@/lib/api";
import { Building2, Mail, User, CalendarDays, Info } from "lucide-react";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm text-slate-800 dark:text-slate-100 break-words">{value || "—"}</div>
      </div>
    </div>
  );
}

// Dữ liệu thật từ GET /api/v1/user/profile. Backend chưa có API sửa thông tin tổ chức nên chỉ xem.
export function TenantProfileView({ profile }: { profile: UserProfile }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {profile.tenantName || "Chưa có tổ chức"}
            </h2>
            <div className="mt-1">
              {profile.subscriptionStatus ? (
                <StatusBadge type="subscription" status={profile.subscriptionStatus} />
              ) : (
                <span className="text-xs text-slate-400">Chưa đăng ký gói thuê bao</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Thông tin tổ chức do hệ thống quản lý, hiện chưa chỉnh sửa được.</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Row icon={<User className="w-4 h-4" />} label="Chủ tổ chức" value={profile.userName} />
        <Row icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
        <Row icon={<Building2 className="w-4 h-4" />} label="Tên tổ chức (Tenant)" value={profile.tenantName} />
        <Row
          icon={<CalendarDays className="w-4 h-4" />}
          label="Thời hạn gói"
          value={profile.startDate && profile.endDate ? `${profile.startDate} → ${profile.endDate}` : null}
        />
        <div className="pt-3">
          <Link
            href={profile.subscriptionStatus ? "/owner/subscription" : "/owner/subscribe"}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {profile.subscriptionStatus ? "Quản lý gói thuê bao →" : "Chọn gói thuê bao →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
