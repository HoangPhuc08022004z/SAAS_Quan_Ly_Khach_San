"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plan } from "@/lib/api/types";
import { api } from "@/lib/api";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { formatBytes } from "@/lib/utils/format";
import { toast } from "sonner";
import { Plus, Edit, Power, Building2, Bed, Users, HardDrive } from "lucide-react";

export function PlanTable({ initialPlans }: { initialPlans: Plan[] }) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredPlans = plans.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    return true;
  });

  const toggleStatus = async (plan: Plan) => {
    const nextStatus = plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const updated = await api.adminSetPlanStatus(plan.id, nextStatus);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Đã đổi trạng thái gói sang ${nextStatus === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}`);
    } catch {
      toast.error("Không thể thay đổi trạng thái gói.");
    }
  };

  const columns: Column<Plan>[] = [
    {
      key: "name",
      header: "Tên gói & Mô tả",
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
          <div className="text-xs text-slate-400 line-clamp-1">{p.description}</div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá & Thời hạn",
      sortable: true,
      render: (p) => (
        <div>
          <MoneyText amount={p.price} className="text-sm font-bold text-slate-900 dark:text-white" />
          <div className="text-[11px] text-slate-400">
            {p.duration} {p.duration_unit === "MONTH" ? "tháng" : p.duration_unit === "YEAR" ? "năm" : "ngày"}
          </div>
        </div>
      ),
    },
    {
      key: "limits",
      header: "Giới hạn tài nguyên",
      render: (p) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="Số khách sạn">
            <Building2 className="w-3.5 h-3.5 text-blue-500" /> {p.max_properties} ks
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="Số phòng">
            <Bed className="w-3.5 h-3.5 text-indigo-500" /> {p.max_rooms} ph
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="Nhân viên">
            <Users className="w-3.5 h-3.5 text-emerald-500" /> {p.max_users} user
          </span>
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="Lưu trữ">
            <HardDrive className="w-3.5 h-3.5 text-amber-500" /> {formatBytes(p.max_storage)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            p.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {p.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/plans/${p.id}`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
            title="Chỉnh sửa gói"
          >
            <Edit className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => toggleStatus(p)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300"
            title={p.status === "ACTIVE" ? "Tạm ngưng cung cấp" : "Kích hoạt cung cấp"}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="INACTIVE">Tạm ngưng</option>
        </select>

        <Link
          href="/admin/plans/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo gói mới</span>
        </Link>
      </div>

      <DataTable columns={columns} data={filteredPlans} exportFileName="danh-sach-goi-dich-vu" />
    </div>
  );
}
