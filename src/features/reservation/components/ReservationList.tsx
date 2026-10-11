"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import {
  Calendar,
  Search,
  Plus,
  LogIn,
  LogOut,
  ExternalLink,
  DoorOpen,
  User,
} from "lucide-react";

export function ReservationList({
  initialReservations,
}: {
  initialReservations: any[];
}) {
  const [reservations] = useState<any[]>(initialReservations);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchCode = (r.code || r.id).toLowerCase().includes(q);
      const matchName = (r.guest?.full_name || "").toLowerCase().includes(q);
      const matchPhone = (r.guest?.phone || "").includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: "code",
      header: "Mã đặt phòng",
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
            {r.code || r.id}
          </div>
          <div className="text-[10px] text-slate-400">{r.booking_channel || "DIRECT"}</div>
        </div>
      ),
    },
    {
      key: "guest",
      header: "Khách hàng",
      render: (r) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span>{r.guest?.full_name || "Khách vãng lai"}</span>
          </div>
          <div className="text-[11px] text-slate-400">{r.guest?.phone || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "rooms",
      header: "Phòng gán",
      render: (r) => (
        <div className="text-xs">
          {r.rooms && r.rooms.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {r.rooms.map((rm: any) => (
                <span
                  key={rm.id}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  P.{rm.room_number}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 italic">Chưa gán</span>
          )}
        </div>
      ),
    },
    {
      key: "check_in_date",
      header: "Thời gian lưu trú",
      sortable: true,
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            <DateText date={r.check_in_date} /> → <DateText date={r.check_out_date} />
          </div>
          <div className="text-[10px] text-slate-400">
            {r.adults || 2} người lớn • {r.children || 0} trẻ em
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (r) => <StatusBadge type="reservation" status={r.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "CONFIRMED" && (
            <Link
              href={`/pms/checkin?reservationId=${r.id}`}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Check-in</span>
            </Link>
          )}

          {r.status === "CHECKED_IN" && (
            <Link
              href={`/pms/checkout?reservationId=${r.id}`}
              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Check-out</span>
            </Link>
          )}

          <Link
            href={`/pms/reservations/${r.id}`}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Xem chi tiết"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Top Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên khách, số điện thoại..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
            <option value="CHECKED_IN">Đang ở (CHECKED_IN)</option>
            <option value="CHECKED_OUT">Đã trả phòng (CHECKED_OUT)</option>
            <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            <option value="NO_SHOW">Vắng mặt (NO_SHOW)</option>
          </select>
        </div>

        <Link
          href="/pms/reservations/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo đặt phòng mới (Wizard)</span>
        </Link>
      </div>

      <DataTable columns={columns} data={filtered} exportFileName="danh-sach-dat-phong" />
    </div>
  );
}
