"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FnbItem } from "@/lib/api/types";
import { fnbApi, type ApiFnbMenu } from "@/lib/api/property-api";
import { useSession } from "@/lib/auth/use-session";
import { FnbMenuItem } from "./FnbMenuItem";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import {
  Utensils,
  Search,
  Plus,
  ClipboardCheck,
  Edit3,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

/** Ánh xạ món từ API thật (GET /api/properties/{id}/fnb-menu) sang model hiển thị. */
function toItem(m: ApiFnbMenu): FnbItem {
  return {
    id: String(m.fnbMenuId),
    property_id: String(m.propertyId),
    name: m.name,
    max_quantity: m.maxQuantity,
    actual_quantity: m.actualQuantity,
    purchase_price: m.purchasePrice,
    profit_percent: m.sellingPricePercent,
    selling_price: m.sellingPrice,
    status: m.status,
  };
}

export function FnbMenuView() {
  const { currentPropertyId, property } = useSession();
  const propertyId = currentPropertyId || property?.id || "";
  const [items, setItems] = useState<FnbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<"ALL" | "AVAILABLE" | "OUT_OF_STOCK">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshItems = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    try {
      setIsRefreshing(true);
      setError(null);
      const res = await fnbApi.list(propertyId);
      setItems((res ?? []).map(toItem));
    } catch (err: any) {
      const msg = err?.message || "Không thể tải thực đơn";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  const filteredItems = items.filter((item) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    const remaining = item.max_quantity - item.actual_quantity;
    if (filterAvailable === "AVAILABLE" && remaining <= 0) return false;
    if (filterAvailable === "OUT_OF_STOCK" && remaining > 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            Thực đơn Ẩm thực & Dịch vụ F&B
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tra cứu món ăn, đồ uống, kiểm soát hạn mức phục vụ hàng ngày
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshItems}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/pms/fnb/approvals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" />
            Phê duyệt F&B
          </Link>

          <Link
            href="/pms/fnb/actuals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
            Ghi số lượng & giá thực tế
          </Link>

          <Link
            href="/pms/fnb/orders/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Lập đơn đặt món
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên món ăn, đồ uống..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterAvailable("ALL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterAvailable === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterAvailable("AVAILABLE")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterAvailable === "AVAILABLE"
                ? "bg-emerald-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Còn suất
          </button>
          <button
            type="button"
            onClick={() => setFilterAvailable("OUT_OF_STOCK")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterAvailable === "OUT_OF_STOCK"
                ? "bg-rose-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Hết suất
          </button>
        </div>
      </div>

      {/* Grid of Menu Items */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải thực đơn...</p>
      ) : error ? (
        <EmptyState
          icon={<Utensils className="w-6 h-6" />}
          title="Không tải được thực đơn"
          description={error}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Utensils className="w-6 h-6" />}
          title="Không tìm thấy món ăn nào"
          description="Thực đơn hiện tại chưa có món nào khớp với điều kiện tìm kiếm."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <FnbMenuItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
