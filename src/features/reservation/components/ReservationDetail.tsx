"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/data/StatusBadge";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import {
  Calendar,
  User,
  DoorOpen,
  Receipt,
  CreditCard,
  LogIn,
  LogOut,
  XCircle,
  Plus,
  Utensils,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export function ReservationDetail({ reservation }: { reservation: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ROOMS_GUEST" | "FOLIO" | "PAYMENTS">("OVERVIEW");

  const totalFolio = reservation.folios?.reduce((sum: number, f: any) => sum + (f.amount || 0), 0) || 0;
  const totalPaid = reservation.payments?.filter((p: any) => p.status === "SUCCESS").reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const balance = totalFolio - totalPaid;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link
          href="/pms/reservations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách đặt phòng</span>
        </Link>
      </div>

      {/* Header and Action Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
              {reservation.code || reservation.id}
            </span>
            <StatusBadge type="reservation" status={reservation.status} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {reservation.guest?.full_name || "Khách hàng"}
          </h2>
          <p className="text-xs text-slate-400">
            Kênh: <span className="font-semibold text-slate-700 dark:text-slate-300">{reservation.booking_channel || "DIRECT"}</span> • Tạo ngày: {reservation.created_at?.slice(0, 10)}
          </p>
        </div>

        {/* Action Buttons based on status */}
        <div className="flex flex-wrap items-center gap-2">
          {reservation.status === "CONFIRMED" && (
            <>
              <Link
                href={`/pms/checkin?reservationId=${reservation.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Tiến hành Check-in</span>
              </Link>
              <Link
                href={`/pms/cancellations?reservationId=${reservation.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl dark:bg-rose-950/40 dark:text-rose-400"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Hủy phòng</span>
              </Link>
            </>
          )}

          {reservation.status === "CHECKED_IN" && (
            <>
              <Link
                href={`/pms/checkout?reservationId=${reservation.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Tiến hành Check-out</span>
              </Link>
              <Link
                href={`/pms/folio/${reservation.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phí Folio</span>
              </Link>
              <Link
                href={`/pms/fnb/orders/new?reservationId=${reservation.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl dark:bg-purple-950/40 dark:text-purple-300"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Đặt món F&B</span>
              </Link>
            </>
          )}

          {reservation.status === "CHECKED_OUT" && (
            <Link
              href={`/pms/folio/${reservation.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl dark:bg-slate-800 dark:text-slate-200"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>In hóa đơn tổng (Folio)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-xl dark:bg-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "OVERVIEW"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab("ROOMS_GUEST")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "ROOMS_GUEST"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Phòng & Khách
        </button>
        <button
          onClick={() => setActiveTab("FOLIO")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "FOLIO"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Folio ({reservation.folios?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("PAYMENTS")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "PAYMENTS"
              ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          Thanh toán
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Lịch lưu trú
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              <DateText date={reservation.check_in_date} /> → <DateText date={reservation.check_out_date} />
            </div>
            <p className="text-[11px] text-slate-400">
              Nhận: 14:00 • Trả: 12:00 trưa
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-indigo-500" />
              Tổng chi phí phát sinh
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              <MoneyText amount={totalFolio} />
            </div>
            <p className="text-[11px] text-slate-400">Đã thanh toán: {totalPaid.toLocaleString()} ₫</p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              Công nợ hiện tại (Balance)
            </span>
            <div className={`text-base font-black ${balance > 0 ? "text-rose-600" : balance < 0 ? "text-amber-600" : "text-emerald-600"}`}>
              <MoneyText amount={balance} />
            </div>
            <p className="text-[11px] text-slate-400">
              {balance === 0 ? "Đã cân bằng công nợ" : balance > 0 ? "Khách cần thanh toán thêm" : "Cần hoàn tiền thừa"}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Rooms & Guest */}
      {activeTab === "ROOMS_GUEST" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">Phòng vật lý đã gán</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reservation.rooms?.map((rm: any) => (
                <div key={rm.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Phòng {rm.room_number}</span>
                    <div className="text-[11px] text-slate-400">Tầng {rm.floor}</div>
                  </div>
                  <StatusBadge type="room" status={rm.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2 text-xs">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">Hồ sơ khách hàng đại diện</h3>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Họ và tên:</span>
              <span className="font-bold text-slate-900 dark:text-white">{reservation.guest?.full_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Số điện thoại:</span>
              <span>{reservation.guest?.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Email:</span>
              <span>{reservation.guest?.email || "Chưa cập nhật"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Giấy tờ tùy thân (CCCD/Passport):</span>
              <span className="font-mono">{reservation.guest?.id_number || "Chưa xuất trình"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Folio */}
      {activeTab === "FOLIO" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">Danh mục khoản phí Folio</h3>
            <span className="text-xs font-bold text-blue-600">Tổng: {totalFolio.toLocaleString()} ₫</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Khoản phí</th>
                  <th className="py-2.5 px-3">Loại</th>
                  <th className="py-2.5 px-3 text-center">SL</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reservation.folios?.map((f: any) => (
                  <tr key={f.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{f.description || f.item_name}</td>
                    <td className="py-2.5 px-3 text-slate-400 uppercase text-[10px]">{f.type}</td>
                    <td className="py-2.5 px-3 text-center">{f.quantity}</td>
                    <td className="py-2.5 px-3 text-right"><MoneyText amount={f.unit_price} /></td>
                    <td className="py-2.5 px-3 text-right font-bold"><MoneyText amount={f.amount} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Payments */}
      {activeTab === "PAYMENTS" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">Lịch sử thanh toán & đặt cọc</h3>
          <div className="space-y-2.5">
            {reservation.payments?.map((p: any) => (
              <div key={p.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{p.payment_type || "DEPOSIT"}</span>
                    <StatusBadge type="payment" status={p.status} />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Mã: {p.id} • Cổng: {p.gateway || "MOMO"}</div>
                </div>
                <div className="text-right">
                  <MoneyText amount={p.amount} className="font-bold text-emerald-600" />
                  <div className="text-[10px] text-slate-400">{p.created_at?.slice(0, 10)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
