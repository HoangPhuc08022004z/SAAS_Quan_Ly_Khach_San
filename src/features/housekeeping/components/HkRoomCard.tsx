"use client";

import React, { useState } from "react";
import { Room, ExtHkIssue } from "@/lib/api/types";
import { StatusBadge } from "@/components/data/StatusBadge";
import { HkStatusButtons } from "./HkStatusButtons";
import { AddIssueDialog } from "./AddIssueDialog";
import { AlertTriangle, Wrench, ShieldAlert } from "lucide-react";

interface HkRoomCardProps {
  room: Room & { cleaningStatus?: string; hkIssue?: ExtHkIssue };
  onStatusChange: (roomId: string, newStatus: Room["status"]) => Promise<void>;
  onRefresh: () => void;
}

export function HkRoomCard({ room, onStatusChange, onRefresh }: HkRoomCardProps) {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const hasOpenIssue = room.hkIssue && room.hkIssue.status === "OPEN";

  async function handleUpdate(newStatus: Room["status"]) {
    try {
      setIsUpdating(true);
      await onStatusChange(room.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div
      className={`p-4 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
        hasOpenIssue
          ? "border-amber-500/50 bg-amber-500/[0.02]"
          : room.status === "VACANT_DIRTY"
          ? "border-rose-500/30"
          : room.status === "CLEANING"
          ? "border-amber-500/30"
          : room.status === "READY"
          ? "border-emerald-500/30"
          : "border-border"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                P.{room.room_number}
              </span>
              <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted">
                Tầng {room.floor}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {room.description || "Phòng tiêu chuẩn"}
            </p>
          </div>
          <StatusBadge status={room.status} type="room" />
        </div>

        {hasOpenIssue && (
          <div className="mt-2 mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Sự cố buồng phòng:</span>{" "}
              {room.hkIssue?.description}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/60">
        <HkStatusButtons
          currentStatus={room.status}
          onUpdateStatus={handleUpdate}
          disabled={isUpdating}
        />

        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="text-xs text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Báo sự cố
          </button>
        </div>
      </div>

      <AddIssueDialog
        roomId={room.id}
        roomNumber={room.room_number}
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
