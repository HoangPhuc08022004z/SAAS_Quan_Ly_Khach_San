"use client";

// API thật: GET /api/properties/{id}/housekeeping/schedule, PATCH .../housekeeping/rooms/{roomId}/status
import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HousekeepingView } from "@/features/housekeeping/components/HousekeepingView";

export default function HousekeepingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Buồng Phòng"
        description="Lịch dọn phòng theo ngày và cập nhật trạng thái phòng: Bẩn → Đang dọn → Sẵn sàng."
      />
      <HousekeepingView />
    </div>
  );
}
