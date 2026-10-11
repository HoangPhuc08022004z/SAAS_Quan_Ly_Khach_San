"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { MoneyText } from "@/components/data/MoneyText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  X,
  Save,
} from "lucide-react";

export function ServiceConfig({
  propertyId,
  catalog,
  initialServices,
}: {
  propertyId: string;
  catalog: any[];
  initialServices: any[];
}) {
  const [services, setServices] = useState<any[]>(initialServices);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<any | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);

  // Form states
  const [price, setPrice] = useState(150000);
  const [customName, setCustomName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("lần");
  const [isSaving, setIsSaving] = useState(false);

  const openAddModal = (catItem: any) => {
    setSelectedCatalogItem(catItem);
    setEditingService(null);
    setCustomName(catItem.name);
    setPrice(catItem.suggested_price || 150000);
    setDescription(catItem.description || "");
    setUnit(catItem.default_unit || "lần");
  };

  const openEditModal = (svc: any) => {
    setEditingService(svc);
    setSelectedCatalogItem(null);
    setCustomName(svc.custom_name || svc.name);
    setPrice(svc.price);
    setDescription(svc.description || "");
    setUnit(svc.unit || "lần");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingService) {
        const updated = await api.updatePropertyService(editingService.id, {
          custom_name: customName.trim(),
          price: Number(price),
          description: description.trim(),
          unit: unit.trim(),
        });
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Đã cập nhật dịch vụ thành công!");
        setEditingService(null);
      } else if (selectedCatalogItem) {
        const created = await api.createPropertyService(propertyId, {
          service_catalog_id: selectedCatalogItem.id,
          custom_name: customName.trim(),
          price: Number(price),
          description: description.trim(),
          unit: unit.trim(),
        });
        setServices((prev) => [...prev, created]);
        toast.success("Đã thêm dịch vụ vào khách sạn thành công!");
        setSelectedCatalogItem(null);
      }
    } catch {
      toast.error("Không thể lưu cấu hình dịch vụ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await api.deletePropertyService(serviceToDelete.id);
      setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      toast.success("Đã gỡ dịch vụ khỏi khách sạn.");
      setServiceToDelete(null);
    } catch {
      toast.error("Không thể xóa dịch vụ này.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "custom_name",
      header: "Tên dịch vụ",
      sortable: true,
      render: (s) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">{s.custom_name || s.name}</div>
          <div className="text-[11px] text-slate-400 line-clamp-1">{s.description || "Dịch vụ tiêu chuẩn"}</div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá niêm yết",
      sortable: true,
      render: (s) => (
        <div>
          <MoneyText amount={s.price} className="font-bold text-xs text-slate-900 dark:text-white" />
          <span className="text-[11px] text-slate-400"> / {s.unit || "lần"}</span>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Trạng thái",
      render: (s) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          Hoạt động
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (s) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(s)}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setServiceToDelete(s)}
            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* SaaS Service Catalog List (BR-C03: chỉ chọn từ catalog) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            <span>Danh Mục Dịch Vụ SaaS Toàn Hệ Thống (Service Catalog)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quy tắc BR-C03: Khách sạn chỉ có thể cấu hình giá và áp dụng các dịch vụ có sẵn trong Catalog của nền tảng SaaS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((cat) => {
            const isAlreadyAdded = services.some((s) => s.service_catalog_id === cat.id);
            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Đơn vị: {cat.default_unit || "lần"}</span>
                  {isAlreadyAdded ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã thêm</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => openAddModal(cat)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-950 dark:text-blue-300"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configured Services Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          Dịch Vụ Đã Cấu Hình Của Khách Sạn ({services.length})
        </h3>
        <DataTable columns={columns} data={services} exportFileName="dich-vu-khach-san" />
      </div>

      {/* Add / Edit Service Modal */}
      {(selectedCatalogItem || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingService ? "Chỉnh Sửa Dịch Vụ" : `Thêm Dịch Vụ: ${selectedCatalogItem?.name}`}
              </h3>
              <button
                onClick={() => {
                  setSelectedCatalogItem(null);
                  setEditingService(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tên hiển thị tại khách sạn <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Giá dịch vụ (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Đơn vị tính</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="lần, kg, người..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCatalogItem(null);
                    setEditingService(null);
                  }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSaving ? "Đang lưu..." : "Lưu dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!serviceToDelete}
        title="Xác nhận gỡ dịch vụ"
        description={`Bạn có chắc muốn gỡ bỏ dịch vụ "${serviceToDelete?.custom_name}" khỏi danh mục phục vụ của khách sạn?`}
        confirmText="Gỡ dịch vụ"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setServiceToDelete(null)}
      />
    </div>
  );
}
