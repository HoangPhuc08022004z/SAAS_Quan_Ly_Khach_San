"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FnbItem } from "@/lib/api/types";
import { api } from "@/lib/api";
import { MoneyText } from "@/components/data/MoneyText";
import { toast } from "sonner";
import {
  Edit3,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from "lucide-react";

interface FnbActualsViewProps {
  initialItems: FnbItem[];
}

interface ItemRowState {
  actual_quantity: number;
  purchase_price: number;
  isSaving: boolean;
}

export function FnbActualsView({ initialItems }: FnbActualsViewProps) {
  const [items, setItems] = useState(initialItems);
  const [rowStates, setRowStates] = useState<Record<string, ItemRowState>>(() => {
    const map: Record<string, ItemRowState> = {};
    initialItems.forEach((item) => {
      map[item.id] = {
        actual_quantity: item.actual_quantity,
        purchase_price: item.purchase_price,
        isSaving: false,
      };
    });
    return map;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshItems() {
    try {
      setIsRefreshing(true);
      const res = await api.listFnbMenu();
      setItems(res);
      const map: Record<string, ItemRowState> = {};
      res.forEach((item) => {
        map[item.id] = {
          actual_quantity: item.actual_quantity,
          purchase_price: item.purchase_price,
          isSaving: false,
        };
      });
      setRowStates(map);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lại dữ liệu món");
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleQuantityChange(id: string, val: number) {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], actual_quantity: Math.max(0, val) },
    }));
  }

  function handlePriceChange(id: string, val: number) {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], purchase_price: Math.max(0, val) },
    }));
  }

  async function handleSaveRow(item: FnbItem) {
    const row = rowStates[item.id];
    if (!row) return;

    try {
      setRowStates((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], isSaving: true },
      }));

      const updated = await api.updateFnbActual(item.id, {
        actual_quantity: row.actual_quantity,
        purchase_price: row.purchase_price,
      });

      toast.success(`Đã cập nhật số lượng và giá thực tế cho món "${item.name}"`);
      // Update local item
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi cập nhật dữ liệu món");
    } finally {
      setRowStates((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], isSaving: false },
      }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pms/fnb/menu"
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-blue-500" />
              Ghi nhận Số lượng & Giá mua thực tế (F&B)
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cập nhật số suất tiêu hao thực tế và giá vốn đầu vào. Giá bán tự động tính lại theo % lợi nhuận.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshItems}
          disabled={isRefreshing}
          className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Làm mới"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 flex items-start gap-2">
        <Calculator className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Công thức tự động (chỉ đọc):</span> Giá bán = Giá mua thực tế × (1 + % Lợi nhuận định mức). Form không cho phép sửa trực tiếp giá bán để đảm bảo tính toàn vẹn dữ liệu.
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Tên món</th>
                <th className="px-4 py-3 text-center">Hạn mức / ngày</th>
                <th className="px-4 py-3">Số lượng thực tế</th>
                <th className="px-4 py-3">Giá mua thực tế (đ)</th>
                <th className="px-4 py-3 text-center">% LN</th>
                <th className="px-4 py-3">Giá bán tự tính</th>
                <th className="px-4 py-3 text-right">Lưu thay đổi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const row = rowStates[item.id] || {
                  actual_quantity: item.actual_quantity,
                  purchase_price: item.purchase_price,
                  isSaving: false,
                };

                const computedSelling = Math.round(
                  row.purchase_price * (1 + item.profit_percent / 100)
                );

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.name}
                      <span className="block text-xs font-normal text-muted-foreground">
                        Món ẩm thực phục vụ tại phòng
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                      {item.max_quantity} suất
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-28">
                        <input
                          type="number"
                          min={0}
                          value={row.actual_quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-36">
                        <input
                          type="number"
                          min={0}
                          step={5000}
                          value={row.purchase_price}
                          onChange={(e) =>
                            handlePriceChange(item.id, parseInt(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-semibold bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      +{item.profit_percent}%
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      <MoneyText amount={computedSelling} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={row.isSaving}
                        onClick={() => handleSaveRow(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {row.isSaving ? "Đang lưu..." : "Lưu"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
