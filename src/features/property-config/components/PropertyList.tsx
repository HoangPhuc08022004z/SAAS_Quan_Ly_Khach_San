"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Hotel,
  Plus,
  MapPin,
  Phone,
  Mail,
  Sliders,
  Settings,
  ArrowRight,
  AlertTriangle,
  Building,
} from "lucide-react";

export function PropertyList({
  initialProperties,
  maxProperties,
  setupStatuses = {},
}: {
  initialProperties: any[];
  maxProperties?: number; // không truyền = không giới hạn (backend chưa có API trả giới hạn của gói)
  setupStatuses?: Record<string, any>;
}) {
  const [properties] = useState<any[]>(initialProperties);

  const isLimitReached = maxProperties !== undefined && properties.length >= maxProperties;

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Hotel className="w-5 h-5 text-blue-500" />
            <span>Khách Sạn Trực Thuộc ({maxProperties !== undefined ? `${properties.length} / ${maxProperties}` : properties.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi khách sạn sở hữu sơ đồ phòng, bảng giá và phân quyền nhân viên độc lập.
          </p>
        </div>

        <div>
          {isLimitReached ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Đạt giới hạn gói ({maxProperties} KS)</span>
            </div>
          ) : (
            <Link
              href="/owner/properties/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm khách sạn mới</span>
            </Link>
          )}
        </div>
      </div>

      {/* Grid of properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => {
          const setup = setupStatuses[p.id] || { completed: ["info"], total: 10 };
          const percent = Math.round((setup.completed?.length / (setup.total || 10)) * 100);

          return (
            <div
              key={p.id}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Property Image & Badge */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={p.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {p.status || "ACTIVE"}
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{p.address}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{p.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{p.email}</span>
                    </div>
                  </div>

                  {/* Setup Progress */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Tiến độ thiết lập</span>
                      <span className="font-bold text-blue-600">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/owner/properties/${p.id}/setup`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Wizard thiết lập</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/owner/properties/${p.id}`}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-800 dark:text-slate-400 text-xs font-semibold"
                    title="Chỉnh sửa thông tin"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/owner/properties/${p.id}/room-types`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    <span>Cấu hình</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
