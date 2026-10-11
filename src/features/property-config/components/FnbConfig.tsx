"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/data/DataTable";
import { MoneyText } from "@/components/data/MoneyText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { calculateSellingPrice } from "@/rules/fnbRules";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  X,
  Save,
} from "lucide-react";

export function FnbConfig({
  propertyId,
  initialMenu,
}: {
  propertyId: string;
  initialMenu: any[];
}) {
  const [menu, setMenu] = useState<any[]>(initialMenu);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("DRINK");
  const [maxQuantity, setMaxQuantity] = useState(50);
  const [purchasePrice, setPurchasePrice] = useState(20000);
  const [profitPercent, setProfitPercent] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const previewSellingPrice = calculateSellingPrice(purchasePrice, profitPercent);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategory("DRINK");
    setMaxQuantity(50);
    setPurchasePrice(20000);
    setProfitPercent(50);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category || "DRINK");
    setMaxQuantity(item.max_quantity || 50);
    setPurchasePrice(item.purchase_price || 0);
    setProfitPercent(item.profit_percent || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên món.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        max_quantity: Number(maxQuantity),
        actual_quantity: 0,
        purchase_price: Number(purchasePrice),
        profit_percent: Number(profitPercent),
        status: "ACTIVE" as const,
      };

      if (editingItem) {
        const updated = await api.updateFnbItem(editingItem.id, payload);
        setMenu((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        toast.success("Đã cập nhật món F&B thành công!");
      } else {
        const created = await api.createFnbItem(propertyId, payload);
        setMenu((prev) => [...prev, created]);
        toast.success("Đã thêm món F&B mới thành công!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Không thể lưu thông tin món F&B.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteFnbItem(itemToDelete.id);
      setMenu((prev) => prev.filter((m) => m.id !== itemToDelete.id));
      toast.success("Đã xóa món F&B thành công.");
      setItemToDelete(null);
    } catch {
      toast.error("Không thể xóa món này.");
    }
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Tên món ẩm thực",
      sortable: true,
      render: (m) => (
        <div>
          <div className="font-bold text-xs text-slate-900 dark:text-white">{m.name}</div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">{m.category || "DRINK"}</span>
        </div>
      ),
    },
    {
      key: "max_quantity",
      header: "Định mức tối đa (Max/ngày)",
      sortable: true,
      render: (m) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {m.max_quantity} suất
        </span>
      ),
    },
    {
      key: "purchase_price",
      header: "Giá nhập thực tế",
      sortable: true,
      render: (m) => <MoneyText amount={m.purchase_price} className="text-xs text-slate-500" />,
    },
    {
      key: "profit_percent",
      header: "% Lợi nhuận",
      sortable: true,
      render: (m) => (
        <span className="text-xs font-bold text-indigo-600">+{m.profit_percent}%</span>
      ),
    },
    {
      key: "selling_price",
      header: "Giá bán niêm yết",
      sortable: true,
      render: (m) => (
        <MoneyText amount={m.selling_price} className="text-xs font-bold text-emerald-600" />
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (m) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(m)}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setItemToDelete(m)}
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
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-500" />
            <span>Thực Đơn Ẩm Thực F&B ({menu.length} món)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Giá bán tự động tính từ: Giá nhập × (1 + % Lợi nhuận). Không được sửa trực tiếp giá bán.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm món mới</span>
        </button>
      </div>

      <DataTable columns={columns} data={menu} exportFileName="thuc-don-fnb" />

      {/* Add / Edit F&B Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingItem ? "Chỉnh Sửa Món F&B" : "Thêm Món F&B Mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tên món ăn / Đồ uống <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cà phê sữa đá, Phở bò..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phân loại</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="DRINK">Đồ uống (Drink)</option>
                    <option value="FOOD">Món ăn (Food)</option>
                    <option value="SNACK">Đồ ăn vặt (Snack)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Định mức ngày (Max Qty)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxQuantity}
                    onChange={(e) => setMaxQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Giá nhập dự kiến (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    % Lợi nhuận định mức
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={profitPercent}
                    onChange={(e) => setProfitPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Read-only Selling Price Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs dark:bg-emerald-950/30 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Giá bán niêm yết (tự động):</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {purchasePrice.toLocaleString()} × (1 + {profitPercent}%)
                  </div>
                </div>
                <MoneyText amount={previewSellingPrice} className="text-base font-black text-emerald-600" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isSaving ? "Đang lưu..." : "Lưu món F&B"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Xác nhận xóa món ăn"
        description={`Bạn có chắc muốn xóa món "${itemToDelete?.name}" khỏi thực đơn F&B?`}
        confirmText="Xóa món"
        variant="destructive"
        onConfirm={handleDelete}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
}
