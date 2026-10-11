"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import {
  Calendar,
  LogIn,
  LogOut,
  Sparkles,
  Utensils,
  AlertTriangle,
  Search,
  ArrowRight,
  DoorOpen,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export function PmsDashboard({
  arrivals,
  departures,
  dirtyRooms,
  fnbRequests,
  noShowCandidates,
}: {
  arrivals: any[];
  departures: any[];
  dirtyRooms: any[];
  fnbRequests: any[];
  noShowCandidates: any[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pms/reservations?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Global Quick Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3"
      >
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tra cứu nhanh đặt phòng theo Họ tên khách, Số điện thoại, Mã phòng hoặc Mã đặt chỗ..."
          className="flex-1 text-xs bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Task Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/pms/checkin"
          className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors dark:border-blue-900/60 dark:bg-blue-950/20"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <LogIn className="w-4 h-4" />
            <span className="text-xl font-black">{arrivals.length}</span>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Sắp Check-in</div>
          <span className="text-[10px] text-slate-400">Hôm nay</span>
        </Link>

        <Link
          href="/pms/checkout"
          className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors dark:border-emerald-900/60 dark:bg-emerald-950/20"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <LogOut className="w-4 h-4" />
            <span className="text-xl font-black">{departures.length}</span>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Sắp Check-out</div>
          <span className="text-[10px] text-slate-400">Hôm nay</span>
        </Link>

        <Link
          href="/pms/housekeeping"
          className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors dark:border-amber-900/60 dark:bg-amber-950/20"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xl font-black">{dirtyRooms.length}</span>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Phòng cần dọn</div>
          <span className="text-[10px] text-slate-400">Chưa sẵn sàng</span>
        </Link>

        <Link
          href="/pms/fnb/approvals"
          className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition-colors dark:border-purple-900/60 dark:bg-purple-950/20"
        >
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <Utensils className="w-4 h-4" />
            <span className="text-xl font-black">{fnbRequests.length}</span>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">F&B chờ duyệt</div>
          <span className="text-[10px] text-slate-400">Yêu cầu quản lý</span>
        </Link>

        <Link
          href="/pms/no-show"
          className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors dark:border-rose-900/60 dark:bg-rose-950/20"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xl font-black">{noShowCandidates.length}</span>
          </div>
          <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">No-Show cảnh báo</div>
          <span className="text-[10px] text-slate-400">Quá hạn Check-in</span>
        </Link>
      </div>

      {/* 2-Column Task Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Khách Đến Hôm Nay ({arrivals.length})
              </h3>
            </div>
            <Link
              href="/pms/checkin"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Vào quầy Check-in</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {arrivals.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center italic">
                Không còn lượt khách Check-in trong ngày hôm nay.
              </div>
            ) : (
              arrivals.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {r.guest?.full_name || "Khách đặt chỗ"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mã: <span className="font-mono">{r.id}</span> • SĐT: {r.guest?.phone || "N/A"}
                    </div>
                  </div>
                  <Link
                    href={`/pms/checkin?reservationId=${r.id}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs"
                  >
                    Check-in
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departures Panel */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Khách Trả Phòng Hôm Nay ({departures.length})
              </h3>
            </div>
            <Link
              href="/pms/checkout"
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Vào quầy Check-out</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {departures.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center italic">
                Không còn lượt khách Check-out trong ngày hôm nay.
              </div>
            ) : (
              departures.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {r.guest?.full_name || "Khách lưu trú"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mã: <span className="font-mono">{r.id}</span> • Trả phòng 12:00
                    </div>
                  </div>
                  <Link
                    href={`/pms/checkout?reservationId=${r.id}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                  >
                    Check-out
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
