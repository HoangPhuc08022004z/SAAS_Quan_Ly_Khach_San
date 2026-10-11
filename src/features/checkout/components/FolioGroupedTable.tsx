"use client";

import React from "react";
import { Folio } from "@/lib/api/types";
import { MoneyText } from "@/components/data/MoneyText";
import { DateText } from "@/components/data/DateText";
import { Utensils, BedDouble, Sparkles, PlusCircle } from "lucide-react";

interface FolioGroupedTableProps {
  folios: Folio[];
  onAddCharge?: () => void;
}

export function FolioGroupedTable({ folios, onAddCharge }: FolioGroupedTableProps) {
  // Group folios by charge_type
  const categories: Record<string, { label: string; icon: any; items: Folio[] }> = {
    ROOM: { label: "Tiền phòng & Phụ thu", icon: BedDouble, items: [] },
    FNB: { label: "Ẩm thực & Minibar (F&B)", icon: Utensils, items: [] },
    SERVICE: { label: "Dịch vụ & Tiện ích", icon: Sparkles, items: [] },
    OTHER: { label: "Khoản khác", icon: PlusCircle, items: [] },
  };

  folios.forEach((f) => {
    const type = f.charge_type;
    if (categories[type]) {
      categories[type].items.push(f);
    } else {
      categories.OTHER.items.push(f);
    }
  });

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([key, cat]) => {
        if (cat.items.length === 0) return null;
        const Icon = cat.icon;
        const subtotal = cat.items.reduce((sum, item) => sum + item.amount, 0);

        return (
          <div key={key} className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {cat.label} ({cat.items.length})
                </span>
              </div>
              <div className="text-xs font-semibold text-foreground">
                Tiểu kế: <MoneyText amount={subtotal} className="text-foreground" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground border-b bg-muted/20">
                  <tr>
                    <th className="px-4 py-2">Diễn giải</th>
                    <th className="px-4 py-2 text-center">SL</th>
                    <th className="px-4 py-2 text-right">Đơn giá</th>
                    <th className="px-4 py-2 text-right">Thành tiền</th>
                    <th className="px-4 py-2 text-right">Thời điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cat.items.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-foreground">
                        {item.description}
                      </td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        <MoneyText amount={item.unit_price} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                        <MoneyText amount={item.amount} />
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        <DateText date={item.created_at} type="datetime" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {folios.length === 0 && (
        <div className="p-8 text-center border rounded-xl text-muted-foreground text-sm">
          Chưa có khoản phí nào được ghi vào Folio.
        </div>
      )}
    </div>
  );
}
