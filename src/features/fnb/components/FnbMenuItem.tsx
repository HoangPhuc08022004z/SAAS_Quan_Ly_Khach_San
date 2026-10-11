"use client";

import React from "react";
import Link from "next/link";
import { FnbItem } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { DailyLimitBar } from "./DailyLimitBar";
import { Utensils, ShoppingBag, Plus } from "lucide-react";

interface FnbMenuItemProps {
  item: FnbItem;
}

export function FnbMenuItem({ item }: FnbMenuItemProps) {
  const remaining = Math.max(0, item.max_quantity - item.actual_quantity);
  const isAvailable = remaining > 0 && item.status === "ACTIVE";

  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-foreground">
              <MoneyText amount={item.selling_price} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Lợi nhuận: +{item.profit_percent}%
            </span>
          </div>
        </div>

        <h3 className="font-bold text-foreground text-sm tracking-tight mb-1">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          Món ăn/đồ uống phục vụ tại phòng hoặc nhà hàng
        </p>

        <DailyLimitBar max={item.max_quantity} actual={item.actual_quantity} />
      </div>

      <div className="mt-4 pt-3 border-t">
        {isAvailable ? (
          <Link
            href={`/pms/fnb/orders/new?itemId=${item.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Đặt món cho phòng
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
          >
            {item.status !== "ACTIVE" ? "Tạm ngưng phục vụ" : "Đã hết phần hôm nay"}
          </button>
        )}
      </div>
    </div>
  );
}
