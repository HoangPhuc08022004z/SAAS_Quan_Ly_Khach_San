"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { UsageMeter } from "@/components/data/UsageMeter";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ReasonDialog } from "@/components/feedback/ReasonDialog";
import { formatBytes } from "@/lib/utils/format";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Building2, Shield, Lock, Unlock, Plus, Hotel } from "lucide-react";

export function TenantTable({ initialTenants }: { initialTenants: any[] }) {
  const [tenants] = useState<any[]>(initialTenants);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = tenants.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Tên Tenant & Mô tả",
      sortable: true,
      render: (t) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.name}</span>
          </div>
          <div className="text-xs text-slate-400 line-clamp-1">{t.description || "Không có mô tả"}</div>
        </div>
      ),
    },
    {
      key: "subscription",
      header: "Gói thuê bao & Hạn dùng",
      render: (t) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {t.plan?.name || "Standard"}
          </div>
          <div className="text-xs text-slate-400">
            Hết hạn: {t.subscription?.end_date?.slice(0, 10) || "2026-12-20"}
          </div>
        </div>
      ),
    },
    {
      key: "propertiesCount",
      header: "Khách sạn",
      render: (t) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {t.propertiesCount} / {t.max_properties}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (t) => <StatusBadge type="tenant" status={t.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (t) => (
        <Link
          href={`/admin/tenants/${t.id}`}
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Chi tiết →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên tổ chức..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="SUSPENDED">Bị khóa</option>
            <option value="PENDING">Chờ kích hoạt</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="danh-sach-tenant" />
    </div>
  );
}

export function TenantDetailView({ tenant }: { tenant: any }) {
  const router = useRouter();
  const [currentTenant, setCurrentTenant] = useState(tenant);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async (reason?: string) => {
    setIsLoading(true);
    const nextStatus = currentTenant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const updated = await api.adminSetTenantStatus(currentTenant.id, nextStatus, reason);
      setCurrentTenant((prev: any) => ({ ...prev, status: updated.status }));
      setIsLockDialogOpen(false);
      toast.success(`Đã cập nhật trạng thái Tenant sang: ${nextStatus === "ACTIVE" ? "Hoạt động" : "Bị khóa"}`);
      router.refresh();
    } catch {
      toast.error("Không thể thay đổi trạng thái Tenant.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{currentTenant.name}</h2>
              <StatusBadge type="tenant" status={currentTenant.status} />
            </div>
            <p className="text-xs text-slate-400">{currentTenant.description || "Khách hàng doanh nghiệp"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentTenant.status === "ACTIVE" ? (
            <button
              onClick={() => setIsLockDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl dark:bg-rose-950/40 dark:text-rose-400"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa tổ chức (Suspend)</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggleStatus()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Mở khóa tổ chức</span>
            </button>
          )}
        </div>
      </div>

      {/* Resource Usage Meters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          <span>Mức Độ Sử Dụng So Với Giới Hạn Gói (Usage Meters)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <UsageMeter
            label="Số Khách Sạn (Properties)"
            current={currentTenant.usage?.properties?.current || 1}
            max={currentTenant.max_properties}
          />
          <UsageMeter
            label="Tổng Số Phòng (Rooms)"
            current={currentTenant.usage?.rooms?.current || 22}
            max={currentTenant.max_rooms}
          />
          <UsageMeter
            label="Tài Khoản Nhân Viên (Users)"
            current={currentTenant.usage?.users?.current || 3}
            max={currentTenant.max_users}
          />
          <UsageMeter
            label="Lưu Trữ Tệp (Storage)"
            current={currentTenant.usage?.storage?.current || 157286400}
            max={currentTenant.max_storage}
            formatValue={(b) => formatBytes(b)}
          />
        </div>
      </div>

      {/* Properties list belonging to this tenant */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Hotel className="w-4 h-4 text-blue-500" />
          <span>Danh Sách Khách Sạn Trực Thuộc ({currentTenant.properties?.length || 0})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentTenant.properties?.map((p: any) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-1"
            >
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</h4>
              <p className="text-[11px] text-slate-500">{p.address}</p>
              <p className="text-[11px] text-slate-400">Hotline: {p.phone} • Email: {p.email}</p>
            </div>
          ))}
        </div>
      </div>

      <ReasonDialog
        isOpen={isLockDialogOpen}
        title="Khóa hoạt động của Tenant này"
        description="Khi bị khóa, toàn bộ các khách sạn và tài khoản nhân viên PMS thuộc Tenant này sẽ không thể đăng nhập hoặc thực hiện nghiệp vụ. Vui lòng nhập lý do khóa."
        confirmText="Xác nhận khóa"
        onConfirm={(reason) => handleToggleStatus(reason)}
        onClose={() => setIsLockDialogOpen(false)}
      />
    </div>
  );
}
