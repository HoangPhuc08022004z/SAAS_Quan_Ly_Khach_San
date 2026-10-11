"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Room, ExtHkIssue } from "@/lib/api/types";
import { api } from "@/lib/api";
import { HkFloorFilter } from "./HkFloorFilter";
import { HkRoomList } from "./HkRoomList";
import { StatCard } from "@/components/data/StatCard";
import { toast } from "sonner";
import {
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface HousekeepingViewProps {
  initialSchedule: Array<Room & { cleaningStatus: string; hkIssue?: ExtHkIssue }>;
  initialIssues: ExtHkIssue[];
}

export function HousekeepingView({
  initialSchedule,
  initialIssues,
}: HousekeepingViewProps) {
  const [rooms, setRooms] = useState(initialSchedule);
  const [issues, setIssues] = useState(initialIssues);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState("2026-10-11");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique floors
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  async function refreshData() {
    try {
      setIsRefreshing(true);
      const [newSchedule, newIssues] = await Promise.all([
        api.getHousekeepingSchedule(selectedDate),
        api.listHkIssues(),
      ]);
      setRooms(newSchedule);
      setIssues(newIssues);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải lại lịch buồng phòng");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleStatusChange(roomId: string, newStatus: Room["status"]) {
    try {
      await api.setRoomStatus(roomId, newStatus);
      toast.success("Đã cập nhật trạng thái phòng thành công");
      // Update local state immediately
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái phòng");
    }
  }

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== null && r.floor !== selectedFloor) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  // Calculate statistics
  const totalRooms = rooms.length;
  const dirtyCount = rooms.filter((r) => r.status === "VACANT_DIRTY").length;
  const cleaningCount = rooms.filter((r) => r.status === "CLEANING").length;
  const readyCount = rooms.filter((r) => r.status === "READY").length;
  const openIssuesCount = issues.filter((i) => i.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý Buồng phòng
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi tình trạng vệ sinh, phân bổ dọn phòng và giải quyết sự cố
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                refreshData();
              }}
              className="bg-transparent focus:outline-none"
            />
          </div>

          <Link
            href="/pms/housekeeping/issues"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Vấn đề & Vật dụng ({openIssuesCount})
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>

          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <StatCard
          title="Tổng số phòng"
          value={totalRooms.toString()}
          icon={<Layers className="w-5 h-5" />}
        />
        <StatCard
          title="Cần dọn (Bẩn)"
          value={dirtyCount.toString()}
          icon={<AlertOctagon className="w-5 h-5 text-rose-500" />}
          trend={dirtyCount > 0 ? { value: `${dirtyCount} phòng`, isUp: true, label: "chờ dọn" } : undefined}
        />
        <StatCard
          title="Đang dọn"
          value={cleaningCount.toString()}
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Sẵn sàng đón khách"
          value={readyCount.toString()}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <StatCard
          title="Sự cố chưa xử lý"
          value={openIssuesCount.toString()}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          trend={openIssuesCount > 0 ? { value: `${openIssuesCount} sự cố`, isUp: true, label: "cần xử lý" } : undefined}
        />
      </div>

      {/* Filter Bar */}
      <HkFloorFilter
        floors={floors}
        selectedFloor={selectedFloor}
        onSelectFloor={setSelectedFloor}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Room Grid */}
      <HkRoomList
        rooms={filteredRooms}
        onStatusChange={handleStatusChange}
        onRefresh={refreshData}
      />
    </div>
  );
}
