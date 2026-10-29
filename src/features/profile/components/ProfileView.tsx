"use client";

import React from "react";
import Link from "next/link";
import { Mail, Building2, CalendarDays, ShieldCheck, Hotel, UserCircle2 } from "lucide-react";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { StatusBadge } from "@/components/data/StatusBadge";
import { saasApi } from "@/lib/api";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { useSession } from "@/lib/auth/use-session";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
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

function ProfileCard({
  name,
  roleLabel,
  children,
}: {
  name: string;
  roleLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-xl font-bold shadow">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">{name}</h2>
          <span className="mt-1 inline-block text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
            {roleLabel}
          </span>
        </div>
      </div>
      <div className="px-5 py-2">{children}</div>
    </div>
  );
}

function OwnerProfile() {
  const { data, loading, error, reload } = useAsyncData(() => saasApi.profile.get());

  return (
    <AsyncBoundary loading={loading} error={error} onRetry={reload}>
      {data && (
        <ProfileCard name={data.userName || data.email} roleLabel="Chủ khách sạn (Owner)">
          <InfoRow icon={<Mail className="w-4 h-4" />} label="Email đăng nhập" value={data.email} />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Tổ chức (Tenant)" value={data.tenantName} />
          <InfoRow
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Trạng thái gói thuê bao"
            value={
              data.subscriptionStatus ? (
                <StatusBadge type="subscription" status={data.subscriptionStatus} />
              ) : (
                "Chưa đăng ký gói"
              )
            }
          />
          <InfoRow
            icon={<CalendarDays className="w-4 h-4" />}
            label="Thời hạn gói"
            value={data.startDate && data.endDate ? `${data.startDate} → ${data.endDate}` : null}
          />
          <div className="py-3">
            <Link
              href={data.subscriptionStatus ? "/owner/subscription" : "/owner/subscribe"}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {data.subscriptionStatus ? "Quản lý gói thuê bao →" : "Chọn gói thuê bao →"}
            </Link>
          </div>
        </ProfileCard>
      )}
    </AsyncBoundary>
  );
}

function AdminProfile() {
  const { account } = useSession();
  return (
    <ProfileCard name={account?.full_name || "SaaS Admin"} roleLabel="SaaS Admin">
      <InfoRow icon={<Mail className="w-4 h-4" />} label="Email đăng nhập" value={account?.email} />
      <InfoRow icon={<ShieldCheck className="w-4 h-4" />} label="Quyền hạn" value="Quản trị nền tảng SaaS" />
    </ProfileCard>
  );
}

function PmsProfile() {
  const { user, role, property } = useSession();
  return (
    <ProfileCard name={user?.full_name || "Nhân viên"} roleLabel={role?.name || "Nhân viên PMS"}>
      <InfoRow icon={<Mail className="w-4 h-4" />} label="Email nhân viên" value={user?.email} />
      <InfoRow icon={<UserCircle2 className="w-4 h-4" />} label="Vai trò" value={role?.name} />
      <InfoRow icon={<Hotel className="w-4 h-4" />} label="Khách sạn làm việc" value={property?.name} />
    </ProfileCard>
  );
}

export function ProfileView({ portal }: { portal: "owner" | "admin" | "pms" }) {
  if (portal === "owner") return <OwnerProfile />;
  if (portal === "admin") return <AdminProfile />;
  return <PmsProfile />;
}
