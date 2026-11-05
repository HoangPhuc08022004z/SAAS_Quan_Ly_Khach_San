"use client";

import React, { useState } from "react";
import { NumberInput } from "@/components/forms/NumberInput";
import { DataTable, Column } from "@/components/data/DataTable";
import { MoneyText } from "@/components/data/MoneyText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { calculateSellingPrice } from "@/rules/fnbRules";
import { fnbApi, type ApiFnbMenu } from "@/lib/api";
import { toUiFnb } from "@/lib/api/adapters";
import { toast } from "sonner";
import {
  Utensils,
  Plus,
  Edit2,
  Power,
  Calculator,
  Eye,
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
  const [itemToToggle, setItemToToggle] = useState<any | null>(null);
  const [detail, setDetail] = useState<ApiFnbMenu | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [maxQuantity, setMaxQuantity] = useState(50);
  const [actualQuantity, setActualQuantity] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(20000);
  const [profitPercent, setProfitPercent] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const previewSellingPrice = calculateSellingPrice(purchasePrice, profitPercent);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setMaxQuantity(50);
    setActualQuantity(0);
    setPurchasePrice(20000);
    setProfitPercent(50);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setMaxQuantity(item.max_quantity || 50);
    setActualQuantity(item.actual_quantity || 0);
    setPurchasePrice(item.purchase_price || 0);
    setProfitPercent(item.profit_percent || 0);
    setIsModalOpen(true);
  };

  // GET /api/properties/{propertyId}/fnb-menu/{menuId}
  const openDetail = async (item: any) => {
    setIsLoadingDetail(true);
    try {
      setDetail(await fnbApi.get(propertyId, item.id));
    } catch (err: any) {
      toast.error(err?.message || "Không tải được chi tiết món.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên món.");
      return;
    }
    if (Number(actualQuantity) > Number(maxQuantity)) {
      toast.error("Số lượng thực tế không được lớn hơn định mức tối đa.");
      return;
    }
    setIsSaving(true);
    try {
      const fields = {
        name: name.trim(),
        maxQuantity: Number(maxQuantity),
        actualQuantity: Number(actualQuantity),
        purchasePrice: Number(purchasePrice),
        sellingPricePercent: Number(profitPercent),
      };

      if (editingItem) {
        // Gọi OpenAPI: PATCH /api/properties/{propertyId}/fnb-menu/{menuId}
        const updated = toUiFnb(await fnbApi.update(propertyId, editingItem.id, fields));
        setMenu((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        toast.success("Đã cập nhật món F&B thành công!");
      } else {
        // Gọi OpenAPI: POST /api/properties/{propertyId}/fnb-menu
        const created = toUiFnb(await fnbApi.create(propertyId, fields));
        setMenu((prev) => [...prev, created]);
        toast.success("Đã thêm món F&B mới thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = String(err?.message || "");
      // 409: Property chưa đăng ký / chưa kích hoạt dịch vụ F&B
      toast.error(
        /F&B|dịch vụ/i.test(msg)
          ? `${msg}. Hãy đăng ký dịch vụ F&B ở bước "Dịch vụ khách sạn" của Wizard trước khi tạo món.`
          : msg || "Không thể lưu thông tin món F&B."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Backend không có API xóa món → đổi trạng thái ACTIVE/INACTIVE
  const handleToggleStatus = async () => {
    if (!itemToToggle) return;
    const next = itemToToggle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      // Gọi OpenAPI: PATCH /api/properties/{propertyId}/fnb-menu/{menuId}/status
      const updated = toUiFnb(await fnbApi.setStatus(propertyId, itemToToggle.id, next));
      setMenu((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      toast.success(next === "ACTIVE" ? "Đã bật lại món." : "Đã tạm ngưng món.");
    } catch (err: any) {
      toast.error(err?.message || "Không thể đổi trạng thái món.");
    } finally {
      setItemToToggle(null);
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
          <span className={`text-[10px] font-bold uppercase ${m.status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"}`}>{m.status === "ACTIVE" ? "Đang bán" : "Tạm ngưng"}</span>
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
      key: "actual_quantity",
      header: "Thực tế",
      sortable: true,
      render: (m) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {m.actual_quantity}/{m.max_quantity}
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
            onClick={() => openDetail(m)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Eye className="w-3 h-3" />
            <span>Chi tiết</span>
          </button>
          <button
            onClick={() => openEditModal(m)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Edit2 className="w-3 h-3" />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => setItemToToggle(m)}
            title={m.status === "ACTIVE" ? "Tạm ngưng món" : "Bật lại món"}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${
              m.status === "ACTIVE"
                ? "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40"
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{m.status === "ACTIVE" ? "Tạm ngưng" : "Bật lại"}</span>
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Số lượng thực tế (hiện có)
                  </label>
                  <NumberInput
                    min="0"
                    value={actualQuantity}
                    onValueChange={(n) => setActualQuantity(n)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Định mức ngày (Max Qty)
                  </label>
                  <NumberInput
                    min="1"
                    required
                    value={maxQuantity}
                    onValueChange={(n) => setMaxQuantity(n)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Giá nhập dự kiến (VNĐ)
                  </label>
                  <NumberInput
                    min="0"
                    step="1000"
                    required
                    value={purchasePrice}
                    onValueChange={(n) => setPurchasePrice(n)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    % Lợi nhuận định mức
                  </label>
                  <NumberInput
                    min="0"
                    required
                    value={profitPercent}
                    onValueChange={(n) => setProfitPercent(n)}
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chi Tiết Món: {detail.name}</h3>
              <button onClick={() => setDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-slate-400">Mã món</dt>
                <dd className="font-semibold">{detail.fnbMenuId}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Trạng thái</dt>
                <dd className="font-semibold">{detail.status === "ACTIVE" ? "Đang bán" : "Tạm ngưng"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Định mức tối đa</dt>
                <dd className="font-semibold">{detail.maxQuantity} suất</dd>
              </div>
              <div>
                <dt className="text-slate-400">Số lượng thực tế</dt>
                <dd className="font-semibold">{detail.actualQuantity} suất</dd>
              </div>
              <div>
                <dt className="text-slate-400">Giá nhập</dt>
                <dd><MoneyText amount={detail.purchasePrice} className="font-semibold" /></dd>
              </div>
              <div>
                <dt className="text-slate-400">% lợi nhuận</dt>
                <dd className="font-semibold">+{detail.sellingPricePercent}%</dd>
              </div>
              <div className="col-span-2 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30">
                <dt className="text-slate-400">Giá bán niêm yết (do hệ thống tính)</dt>
                <dd><MoneyText amount={detail.sellingPrice} className="text-lg font-black text-emerald-600" /></dd>
              </div>
            </dl>
            <div className="flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!itemToToggle}
        title={itemToToggle?.status === "ACTIVE" ? "Tạm ngưng món ăn" : "Bật lại món ăn"}
        description={
          itemToToggle?.status === "ACTIVE"
            ? `Món "${itemToToggle?.name}" sẽ không còn xuất hiện khi gọi món. Bạn có thể bật lại bất cứ lúc nào.`
            : `Món "${itemToToggle?.name}" sẽ được bán trở lại.`
        }
        confirmText="Xác nhận"
        onConfirm={handleToggleStatus}
        onClose={() => setItemToToggle(null)}
      />
    </div>
  );
}
