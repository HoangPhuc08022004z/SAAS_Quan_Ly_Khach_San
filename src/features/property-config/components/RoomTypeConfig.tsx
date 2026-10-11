"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/data/DataTable";
import { TagInput } from "@/components/forms/TagInput";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  Bed,
  Layers,
  ArrowRight,
  DollarSign,
  X,
  Save,
} from "lucide-react";

export function RoomTypeConfig({
  propertyId,
  initialRoomTypes,
}: {
  propertyId: string;
  initialRoomTypes: any[];
}) {
  const [roomTypes, setRoomTypes] = useState<any[]>(initialRoomTypes);
  const [editingType, setEditingType] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [bedType, setBedType] = useState("1 Giường King");
  const [numBeds, setNumBeds] = useState(1);
  const [numberOfRooms, setNumberOfRooms] = useState(5);
  const [amenities, setAmenities] = useState<string[]>(["Wifi tốc độ cao", "Điều hòa hai chiều"]);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  const openCreateModal = () => {
    setEditingType(null);
    setName("");
    setDescription("");
    setCapacity(2);
    setBedType("1 Giường King");
    setNumBeds(1);
    setNumberOfRooms(5);
    setAmenities(["Wifi", "Điều hòa", "Minibar"]);
    setImageUrl("https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800");
    setStatus("ACTIVE");
    setIsModalOpen(true);
  };

  const openEditModal = (rt: any) => {
    setEditingType(rt);
    setName(rt.name);
    setDescription(rt.description || "");
    setCapacity(rt.capacity || 2);
    setBedType(rt.bed_type || "1 Giường King");
    setNumBeds(rt.num_beds || 1);
    setNumberOfRooms(rt.number_of_rooms || 5);
    setAmenities(Array.isArray(rt.amenities) ? rt.amenities : ["Wifi"]);
    setImageUrl(rt.image_url || "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800");
    setStatus(rt.status || "ACTIVE");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên loại phòng không được để trống.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        capacity: Number(capacity),
        bed_type: bedType,
        num_beds: Number(numBeds),
        number_of_rooms: Number(numberOfRooms),
        amenities,
        image_url: imageUrl,
        status,
      };

      if (editingType) {
        const updated = await api.updateRoomType(editingType.id, payload);
        setRoomTypes((prev) => prev.map((rt) => (rt.id === updated.id ? updated : rt)));
        toast.success("Đã cập nhật loại phòng thành công!");
      } else {
        const created = await api.createRoomType(propertyId, payload);
        setRoomTypes((prev) => [...prev, created]);
        toast.success("Đã tạo mới loại phòng thành công!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Không thể lưu thông tin loại phòng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (rt: any) => {
    const nextStatus = rt.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.setRoomTypeStatus(rt.id, nextStatus);
      setRoomTypes((prev) =>
        prev.map((item) => (item.id === rt.id ? { ...item, status: nextStatus } : item))
      );
      toast.success(`Đã đổi trạng thái sang: ${nextStatus === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}`);
    } catch {
      toast.error("Không thể đổi trạng thái loại phòng.");
    }
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    try {
      await api.deleteRoomType(typeToDelete.id);
      setRoomTypes((prev) => prev.filter((rt) => rt.id !== typeToDelete.id));
      toast.success("Đã xóa loại phòng thành công.");
      setTypeToDelete(null);
    } catch {
      toast.error("Không thể xóa loại phòng này.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Tên loại phòng",
      sortable: true,
      render: (rt) => (
        <div className="flex items-center gap-3">
          <img
            src={rt.image_url || "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=200"}
            alt={rt.name}
            className="h-10 w-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
          />
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">{rt.name}</div>
            <div className="text-[11px] text-slate-400 line-clamp-1">{rt.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Sức chứa & Giường",
      render: (rt) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{rt.capacity} người lớn</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Bed className="w-3.5 h-3.5 text-indigo-400" />
            <span>{rt.num_beds} x {rt.bed_type}</span>
          </div>
        </div>
      ),
    },
    {
      key: "number_of_rooms",
      header: "Chỉ tiêu phòng",
      sortable: true,
      render: (rt) => (
        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{rt.number_of_rooms} phòng</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (rt) => (
        <button
          onClick={() => handleToggleStatus(rt)}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
            rt.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {rt.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Cấu hình",
      render: (rt) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/owner/room-types/${rt.id}/rooms`}
            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold dark:bg-blue-950 dark:text-blue-400 flex items-center gap-1"
          >
            <span>Phòng</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href={`/owner/room-types/${rt.id}/rate`}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1"
          >
            <DollarSign className="w-3 h-3" />
            <span>Giá</span>
          </Link>
          <button
            onClick={() => openEditModal(rt)}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTypeToDelete(rt)}
            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Danh Sách Loại Phòng ({roomTypes.length})
          </h3>
          <p className="text-xs text-slate-400">
            Khai báo phân loại phòng, định mức số lượng và tiện nghi trước khi tạo phòng vật lý.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm loại phòng</span>
        </button>
      </div>

      <DataTable columns={columns} data={roomTypes} exportFileName="danh-sach-loai-phong" />

      {/* Room Type Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {editingType ? "Chỉnh Sửa Loại Phòng" : "Thêm Loại Phòng Mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên loại phòng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Deluxe City View Double"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sức chứa (người lớn)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chỉ tiêu số phòng (number_of_rooms) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfRooms}
                    onChange={(e) => setNumberOfRooms(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Loại giường
                  </label>
                  <input
                    type="text"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    placeholder="King Bed / 2 Twin Beds"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Số lượng giường
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={numBeds}
                    onChange={(e) => setNumBeds(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mô tả loại phòng</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tiện nghi phòng</label>
                <TagInput
                  tags={amenities}
                  onChange={setAmenities}
                  placeholder="Nhập tiện nghi và ấn Enter (VD: Bồn tắm, Ban công)..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Đang lưu..." : "Lưu loại phòng"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!typeToDelete}
        title="Xác nhận xóa loại phòng"
        description={`Bạn có chắc chắn muốn xóa loại phòng "${typeToDelete?.name}"? Tất cả các phòng vật lý thuộc loại này sẽ bị ảnh hưởng.`}
        confirmText="Xóa loại phòng"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setTypeToDelete(null)}
      />
    </div>
  );
}
