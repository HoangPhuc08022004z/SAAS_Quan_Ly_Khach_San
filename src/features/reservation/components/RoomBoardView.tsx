"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/data/StatusBadge";
import { DateText } from "@/components/data/DateText";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Grid,
  Map,
  DoorOpen,
  User,
  Calendar,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export function RoomBoardView({
  initialRooms,
  roomTypes,
}: {
  initialRooms: any[];
  roomTypes: any[];
}) {
  const [rooms, setRooms] = useState<any[]>(initialRooms);
  const [viewMode, setViewMode] = useState<"GRID" | "MAP">("MAP");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("ALL");
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Group rooms by floor for map view
  const filteredRooms = rooms.filter((r) =>
    selectedRoomTypeId === "ALL" ? true : r.room_type_id === selectedRoomTypeId
  );

  const floors = Array.from(new Set(filteredRooms.map((r) => r.floor))).sort((a, b) => a - b);

  const handleChangeStatus = async (status: string) => {
    if (!selectedRoom) return;
    setIsChangingStatus(true);
    try {
      const updated = await api.setRoomStatus(selectedRoom.id, status as any);
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setSelectedRoom((prev: any) => ({ ...prev, status: updated.status, is_available: updated.is_available }));
      toast.success(`Đã đổi trạng thái phòng sang: ${status}`);
    } catch {
      toast.error("Không thể thay đổi trạng thái phòng.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const statusBgMap: Record<string, string> = {
    READY: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    OCCUPIED: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    VACANT_DIRTY: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    CLEANING: "border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
    MAINTENANCE: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Filter & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Lọc loại phòng:</label>
          <select
            value={selectedRoomTypeId}
            onChange={(e) => setSelectedRoomTypeId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
          >
            <option value="ALL">Tất cả loại phòng ({rooms.length})</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Sẵn sàng (READY)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Có khách (OCCUPIED)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Chưa dọn (DIRTY)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              Đang dọn (CLEANING)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Bảo trì
            </span>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl dark:bg-slate-800">
            <button
              onClick={() => setViewMode("MAP")}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                viewMode === "MAP"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Sơ đồ tầng</span>
            </button>
            <button
              onClick={() => setViewMode("GRID")}
              className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 ${
                viewMode === "GRID"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Lưới lịch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sơ Đồ Tầng (Floor Map View) */}
      {viewMode === "MAP" && (
        <div className="space-y-6">
          {floors.map((fl) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === fl);
            return (
              <div
                key={fl}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-400">
                    Tầng {fl}
                  </span>
                  <span className="text-xs text-slate-400">({floorRooms.length} phòng)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {floorRooms.map((r) => {
                    const statusClass = statusBgMap[r.status] || "border-slate-200 bg-white text-slate-800";
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRoom(r)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-102 flex flex-col justify-between h-24 ${statusClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black tracking-tight">{r.room_number}</span>
                          <StatusBadge type="room" status={r.status} />
                        </div>
                        <div className="text-[10px] opacity-80 line-clamp-1">{r.roomType?.name || "Standard"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lưới Lịch Phòng (Grid View) */}
      {viewMode === "GRID" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto space-y-3">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Phòng</th>
                <th className="py-2.5 px-3">Loại phòng</th>
                <th className="py-2.5 px-3">Hôm nay (11/10)</th>
                <th className="py-2.5 px-3">12/10</th>
                <th className="py-2.5 px-3">13/10</th>
                <th className="py-2.5 px-3">14/10</th>
                <th className="py-2.5 px-3">15/10</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    P.{r.room_number} (T.{r.floor})
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{r.roomType?.name}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge type="room" status={r.status} />
                  </td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Trống</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Trống</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Trống</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">Trống</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Room Detail Popover / Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Phòng {selectedRoom.room_number} - Tầng {selectedRoom.floor}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Loại phòng:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedRoom.roomType?.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Trạng thái hiện tại:</span>
                <StatusBadge type="room" status={selectedRoom.status} />
              </div>
            </div>

            {/* Quick Status Change */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Đổi nhanh trạng thái buồng phòng:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => handleChangeStatus("READY")}
                  disabled={isChangingStatus}
                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  Sẵn sàng (READY)
                </button>
                <button
                  onClick={() => handleChangeStatus("VACANT_DIRTY")}
                  disabled={isChangingStatus}
                  className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                >
                  Chưa dọn (DIRTY)
                </button>
                <button
                  onClick={() => handleChangeStatus("CLEANING")}
                  disabled={isChangingStatus}
                  className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
                >
                  Đang dọn (CLEANING)
                </button>
                <button
                  onClick={() => handleChangeStatus("MAINTENANCE")}
                  disabled={isChangingStatus}
                  className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                >
                  Bảo trì (MAINTENANCE)
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
