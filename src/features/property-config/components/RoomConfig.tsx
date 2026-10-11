"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/data/DataTable";
import { StatusBadge } from "@/components/data/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DoorOpen,
  Plus,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Save,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function RoomConfig({
  roomType,
  initialRooms,
}: {
  roomType: any;
  initialRooms: any[];
}) {
  const [rooms, setRooms] = useState<any[]>(initialRooms);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<any | null>(null);

  // Single room form
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Bulk rooms form
  const [bulkFloor, setBulkFloor] = useState(2);
  const [startRoom, setStartRoom] = useState(1);
  const [endRoom, setEndRoom] = useState(5);
  const [prefix, setPrefix] = useState("");

  const targetCount = roomType.number_of_rooms || 5;
  const currentCount = rooms.length;
  const isMatch = currentCount === targetCount;

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      toast.error("Vui lòng nhập số phòng.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await api.createRoom(roomType.id, {
        room_number: roomNumber.trim(),
        floor: Number(floor),
        description: description.trim(),
      });
      setRooms((prev) => [...prev, created]);
      setIsAddOpen(false);
      setRoomNumber("");
      setDescription("");
      toast.success(`Đã thêm phòng ${created.room_number} thành công!`);
    } catch {
      toast.error("Không thể thêm phòng mới.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (endRoom < startRoom) {
      toast.error("Phòng kết thúc phải lớn hơn hoặc bằng phòng bắt đầu.");
      return;
    }
    setIsSaving(true);
    try {
      const created = await api.bulkCreateRooms(roomType.id, {
        floor: Number(bulkFloor),
        startRoom: Number(startRoom),
        endRoom: Number(endRoom),
        prefix: prefix.trim() || undefined,
      });
      setRooms((prev) => [...prev, ...created]);
      setIsBulkOpen(false);
      toast.success(`Đã tạo hàng loạt ${created.length} phòng mới!`);
    } catch {
      toast.error("Không thể tạo hàng loạt phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;
    try {
      await api.deleteRoom(roomToDelete.id);
      setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
      toast.success("Đã xóa phòng thành công.");
      setRoomToDelete(null);
    } catch {
      toast.error("Không thể xóa phòng này.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "room_number",
      header: "Số phòng",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-bold text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            {r.room_number}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">Phòng {r.room_number}</div>
            <div className="text-[11px] text-slate-400">{r.description || `Tầng ${r.floor}`}</div>
          </div>
        </div>
      ),
    },
    {
      key: "floor",
      header: "Tầng",
      sortable: true,
      render: (r) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tầng {r.floor}</span>,
    },
    {
      key: "status",
      header: "Trạng thái buồng phòng",
      render: (r) => <StatusBadge type="room" status={r.status} />,
    },
    {
      key: "is_available",
      header: "Sẵn sàng đón khách",
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
            r.is_available ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {r.is_available ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
          <span>{r.is_available ? "Sẵn sàng" : "Đang giữ / Có khách"}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (r) => (
        <button
          onClick={() => setRoomToDelete(r)}
          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          title="Xóa phòng"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link
          href={`/owner/properties/${roomType.property_id}/room-types`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách loại phòng</span>
        </Link>
      </div>

      {/* Room Count Guard Banner (BR-C02) */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isMatch
            ? "border-emerald-200 bg-emerald-50/30 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200"
            : "border-amber-200 bg-amber-50/40 text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isMatch
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
            }`}
          >
            {isMatch ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">
                Đã tạo: {currentCount} / {targetCount} phòng theo chỉ tiêu
              </h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isMatch ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>
                {isMatch ? "Đủ số lượng" : "Cần bổ sung"}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              Quy tắc BR-C02: Số lượng phòng vật lý thực tế cần khớp chính xác với chỉ tiêu &quot;number_of_rooms&quot; của loại phòng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm 1 phòng</span>
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tạo hàng loạt</span>
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={rooms} exportFileName={`danh-sach-phong-${roomType.name}`} />

      {/* Add Single Room Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thêm Phòng Mới</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingle} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Số phòng (Room Number) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Ví dụ: 101, 202, VIP1..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tầng lầu</label>
                <input
                  type="number"
                  min="1"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Ghi chú vị trí</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Gần thang máy, view biển..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSaving ? "Đang lưu..." : "Thêm phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Room Creation Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tạo Hàng Loạt Phòng Theo Dải Số</h3>
              <button onClick={() => setIsBulkOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tầng</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bulkFloor}
                  onChange={(e) => setBulkFloor(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Từ số phòng</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={startRoom}
                    onChange={(e) => setStartRoom(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Đến số phòng</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={endRoom}
                    onChange={(e) => setEndRoom(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Tiền tố số phòng (Tùy chọn)</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Ví dụ: P hoặc bỏ trống để tạo dạng 201..205"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500">
                Sẽ tạo tổng cộng <strong>{Math.max(0, endRoom - startRoom + 1)}</strong> phòng mới trên tầng {bulkFloor}.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSaving ? "Đang tạo..." : "Xác nhận tạo hàng loạt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!roomToDelete}
        title="Xác nhận xóa phòng"
        description={`Bạn có chắc muốn xóa phòng "${roomToDelete?.room_number}"?`}
        confirmText="Xóa phòng"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setRoomToDelete(null)}
      />
    </div>
  );
}
