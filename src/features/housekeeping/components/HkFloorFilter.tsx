"use client";

import React from "react";
import { Filter, Layers } from "lucide-react";

interface HkFloorFilterProps {
  floors: number[];
  selectedFloor: number | null;
  onSelectFloor: (floor: number | null) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function HkFloorFilter({
  floors,
  selectedFloor,
  onSelectFloor,
  statusFilter,
  onStatusFilterChange,
}: HkFloorFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card border rounded-xl">
      {/* Floor selection */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Tầng:
        </span>
        <button
          type="button"
          onClick={() => onSelectFloor(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
            selectedFloor === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Tất cả
        </button>
        {floors.map((floor) => (
          <button
            key={floor}
            type="button"
            onClick={() => onSelectFloor(floor)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              selectedFloor === floor
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Tầng {floor}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="text-xs font-medium bg-background border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="VACANT_DIRTY">Chờ dọn (Bẩn)</option>
          <option value="CLEANING">Đang dọn</option>
          <option value="READY">Đã sẵn sàng</option>
          <option value="OCCUPIED">Đang có khách</option>
          <option value="MAINTENANCE">Đang bảo trì</option>
        </select>
      </div>
    </div>
  );
}
