"use client";

import React from "react";
import { Room, ExtHkIssue } from "@/lib/api/types";
import { HkRoomCard } from "./HkRoomCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Sparkles } from "lucide-react";

interface HkRoomListProps {
  rooms: Array<Room & { cleaningStatus?: string; hkIssue?: ExtHkIssue }>;
  onStatusChange: (roomId: string, newStatus: Room["status"]) => Promise<void>;
  onRefresh: () => void;
}

export function HkRoomList({ rooms, onStatusChange, onRefresh }: HkRoomListProps) {
  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="w-6 h-6" />}
        title="Không tìm thấy phòng phù hợp"
        description="Không có phòng nào thỏa mãn tiêu chí lọc hiện tại."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <HkRoomCard
          key={room.id}
          room={room}
          onStatusChange={onStatusChange}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
