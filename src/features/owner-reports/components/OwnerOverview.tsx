"use client";

import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/data/StatusBadge";
import type { UserProfile } from "@/lib/api";
import { Hotel, BedDouble, Layers, ShieldCheck, ArrowRight, Plus } from "lucide-react";

export interface OwnerPropertyRow {
  id: string;
  name: string;
  address: string;
  roomTypeCount: number;
  roomCount: number;
  setupCompleted: number;
  setupTotal: number;
}

export interface OwnerOverviewData {
  profile: UserProfile;
  properties: OwnerPropertyRow[];
}

export function OwnerOverview({ data }: { data: OwnerOverviewData }) {
  const { profile, properties } = data;
  const totalRooms = properties.reduce((sum, p) => sum + p.roomCount, 0);
  const totalRoomTypes = properties.reduce((sum, p) => sum + p.roomTypeCount, 0);

  const cards = [
    {
      title: "Số cơ sở khách sạn",
      value: `${properties.length}`,
      hint: "Đã tạo trong tổ chức của bạn",
      icon: Hotel,
      tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      title: "Tổng số loại phòng",
      value: `${totalRoomTypes}`,
      hint: "Trên tất cả khách sạn",
      icon: Layers,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      title: "Tổng số phòng",
      value: `${totalRooms}`,
      hint: "Phòng vật lý đã cấu hình",
      icon: BedDouble,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{c.title}</span>
              <div className={`p-2 rounded-xl ${c.tone}`}>
                <c.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{c.value}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{c.hint}</div>
            </div>
          </div>
        ))}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Gói thuê bao</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {profile.subscriptionStatus ? (
              <StatusBadge type="subscription" status={profile.subscriptionStatus} />
            ) : (
              <span className="text-sm font-bold text-slate-500">Chưa đăng ký</span>
            )}
            <div className="text-[11px] text-slate-400">
              {profile.endDate ? `Hết hạn: ${profile.endDate}` : "—"}
            </div>
            <Link
              href="/owner/subscription"
              className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Quản lý thuê bao</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Khách Sạn Của Bạn</h3>
            <p className="text-xs text-slate-400">Tiến độ cấu hình của từng khách sạn</p>
          </div>
          <Link
            href="/owner/properties/new"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm khách sạn</span>
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Bạn chưa có khách sạn nào. Hãy tạo khách sạn đầu tiên để bắt đầu cấu hình.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tên khách sạn</th>
                  <th className="py-3 px-4">Địa chỉ</th>
                  <th className="py-3 px-4 text-center">Loại phòng</th>
                  <th className="py-3 px-4 text-center">Phòng</th>
                  <th className="py-3 px-4 text-center">Tiến độ thiết lập</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {properties.map((p) => {
                  const done = p.setupCompleted >= p.setupTotal;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{p.address}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{p.roomTypeCount}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{p.roomCount}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            done
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {p.setupCompleted}/{p.setupTotal} bước
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/owner/properties/${p.id}/setup`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Thiết lập →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
