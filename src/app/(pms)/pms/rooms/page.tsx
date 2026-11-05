"use client";

// Sơ đồ phòng — dữ liệu thật: GET /api/public/properties/{id}/available-rooms (+ GET /api/properties/{id}/rooms/configuration nếu là Owner)
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomBoardLive } from "@/features/reservation/components/RoomBoardLive";

export default function PmsRoomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sơ Đồ Phòng"
        description="Tình trạng phòng theo tầng và theo đêm lưu trú, lấy từ hệ thống đặt phòng."
      />
      <RoomBoardLive />
    </div>
  );
}
