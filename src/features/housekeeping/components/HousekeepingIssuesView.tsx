"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExtHkIssue, Room } from "@/lib/api/types";
import { api } from "@/lib/api";
import { DateText } from "@/components/data/DateText";
import { ResolveIssueDialog } from "./ResolveIssueDialog";
import { AddIssueDialog } from "./AddIssueDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  RotateCcw,
  Wrench,
} from "lucide-react";

interface HousekeepingIssuesViewProps {
  initialIssues: ExtHkIssue[];
  rooms: Room[];
}

export function HousekeepingIssuesView({
  initialIssues,
  rooms,
}: HousekeepingIssuesViewProps) {
  const [issues, setIssues] = useState(initialIssues);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedIssueToResolve, setSelectedIssueToResolve] = useState<ExtHkIssue | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoomIdForAdd, setSelectedRoomIdForAdd] = useState(rooms[0]?.id || "");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refreshIssues() {
    try {
      setIsRefreshing(true);
      const updated = await api.listHkIssues();
      setIssues(updated);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải danh sách sự cố");
    } finally {
      setIsRefreshing(false);
    }
  }

  const filteredIssues = issues.filter((i) => {
    if (statusFilter !== "ALL" && i.status !== statusFilter) return false;
    return true;
  });

  const selectedRoomForAdd = rooms.find((r) => r.id === selectedRoomIdForAdd);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pms/housekeeping"
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Vấn đề & Vật dụng thiếu
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Theo dõi tình trạng thiết bị hư hỏng, thiếu đồ tiêu hao và tiến độ xử lý
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshIssues}
            disabled={isRefreshing}
            className="p-2 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Làm mới"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Báo sự cố mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 p-3 bg-card border rounded-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            Tất cả ({issues.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("OPEN")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === "OPEN"
                ? "bg-amber-500 text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            Chưa xử lý ({issues.filter((i) => i.status === "OPEN").length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("RESOLVED")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === "RESOLVED"
                ? "bg-emerald-600 text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            Đã xử lý ({issues.filter((i) => i.status === "RESOLVED").length})
          </button>
        </div>
      </div>

      {/* Issues Table */}
      {filteredIssues.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Không có sự cố nào"
          description="Hiện tại không có sự cố buồng phòng nào trong danh sách."
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Phòng</th>
                  <th className="px-4 py-3">Loại vấn đề</th>
                  <th className="px-4 py-3">Mô tả sự cố</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Cách xử lý</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIssues.map((issue) => {
                  const room = rooms.find((r) => r.id === issue.room_id);
                  const isOpen = issue.status === "OPEN";

                  return (
                    <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        P.{room?.room_number || issue.room_id}
                        <span className="block text-xs font-normal text-muted-foreground">
                          Tầng {room?.floor || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">
                        {issue.issue_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground max-w-xs break-words">
                        {issue.description}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        <DateText date={issue.created_at} type="datetime" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Chưa xử lý
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã xử lý
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
                        {issue.resolution ? (
                          <span className="text-foreground">{issue.resolution}</span>
                        ) : (
                          <span className="italic text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => setSelectedIssueToResolve(issue)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                          >
                            <Wrench className="w-3 h-3" />
                            Xử lý
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog to Resolve */}
      <ResolveIssueDialog
        issue={selectedIssueToResolve}
        isOpen={!!selectedIssueToResolve}
        onClose={() => setSelectedIssueToResolve(null)}
        onSuccess={refreshIssues}
      />

      {/* Dialog to Add */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden p-4">
            <h3 className="font-semibold text-foreground mb-3">Chọn phòng báo sự cố</h3>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Phòng
              </label>
              <select
                value={selectedRoomIdForAdd}
                onChange={(e) => setSelectedRoomIdForAdd(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    P.{r.room_number} (Tầng {r.floor})
                  </option>
                ))}
              </select>
            </div>

            <AddIssueDialog
              roomId={selectedRoomIdForAdd}
              roomNumber={selectedRoomForAdd?.room_number || ""}
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={() => {
                setIsAddModalOpen(false);
                refreshIssues();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
